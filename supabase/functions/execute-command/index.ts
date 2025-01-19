import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Client } from "npm:ssh2@1.11.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    const { serverId, command } = await req.json()
    
    if (!serverId || !command) {
      console.error('Missing required parameters:', { serverId, command })
      return new Response(
        JSON.stringify({ 
          error: 'Server ID and command are required',
          details: { serverId, command }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log('Executing command:', command, 'on server:', serverId)

    const { data: server, error: serverError } = await supabaseClient
      .from('servers')
      .select('*')
      .eq('id', serverId)
      .single()

    if (serverError || !server) {
      console.error('Server not found:', serverError)
      return new Response(
        JSON.stringify({ 
          error: 'Server not found',
          details: serverError?.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // Create command record
    const { data: commandRecord, error: commandError } = await supabaseClient
      .from('server_commands')
      .insert({
        server_id: serverId,
        command,
        status: 'executing'
      })
      .select()
      .single()

    if (commandError) {
      console.error('Failed to create command record:', commandError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create command record',
          details: commandError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    // Execute SSH command
    const ssh = new Client()
    
    try {
      const output = await new Promise((resolve, reject) => {
        ssh.on('ready', () => {
          console.log('SSH connection established')
          ssh.exec(command, (err, stream) => {
            if (err) {
              console.error('SSH exec error:', err)
              reject(err)
              return
            }

            let output = ''
            let errorOutput = ''

            stream.on('data', (data: Buffer) => {
              output += data.toString()
              console.log('Stream data:', data.toString())
            })

            stream.stderr.on('data', (data: Buffer) => {
              errorOutput += data.toString()
              console.error('Stream error:', data.toString())
            })

            stream.on('close', () => {
              console.log('Stream closed')
              resolve(errorOutput || output)
            })
          })
        })

        ssh.on('error', (err) => {
          console.error('SSH connection error:', err)
          reject(err)
        })

        ssh.on('handshake', (negotiated) => {
          console.log('SSH handshake details:', negotiated)
        })

        // Enhanced private key handling
        let privateKey = server.ssh_private_key || ''
        
        // Normalize line endings
        privateKey = privateKey.replace(/\r\n/g, '\n')
        
        // Add headers if missing
        if (!privateKey.includes('-----BEGIN')) {
          console.log('Adding OpenSSH headers to private key')
          privateKey = `-----BEGIN OPENSSH PRIVATE KEY-----\n${privateKey}\n-----END OPENSSH PRIVATE KEY-----`
        }

        // Clean up any extra whitespace
        privateKey = privateKey
          .split('\n')
          .map(line => line.trim())
          .join('\n')

        console.log('Attempting SSH connection to:', server.host)
        console.log('Private key format:', privateKey.includes('-----BEGIN') ? 'OpenSSH' : 'Raw')
        console.log('Private key length:', privateKey.length)
        console.log('Private key structure:', {
          hasBeginMarker: privateKey.includes('-----BEGIN'),
          hasEndMarker: privateKey.includes('-----END'),
          lineCount: privateKey.split('\n').length
        })

        ssh.connect({
          host: server.host,
          username: server.ssh_username,
          privateKey,
          debug: (debug) => console.log('SSH Debug:', debug),
          algorithms: {
            kex: [
              'diffie-hellman-group14-sha256',
              'diffie-hellman-group16-sha512',
              'diffie-hellman-group18-sha512',
              'diffie-hellman-group-exchange-sha256',
              'ecdh-sha2-nistp256',
              'ecdh-sha2-nistp384',
              'ecdh-sha2-nistp521'
            ],
            serverHostKey: [
              'ssh-rsa',
              'rsa-sha2-256',
              'rsa-sha2-512',
              'ecdsa-sha2-nistp256',
              'ecdsa-sha2-nistp384',
              'ecdsa-sha2-nistp521',
              'ssh-ed25519'
            ],
            cipher: [
              'aes128-ctr',
              'aes192-ctr',
              'aes256-ctr',
              'aes128-gcm@openssh.com',
              'aes256-gcm@openssh.com'
            ],
            hmac: [
              'hmac-sha2-256',
              'hmac-sha2-512'
            ]
          },
          hostVerifier: () => true
        })
      })

      // Update command status to completed
      await supabaseClient
        .from('server_commands')
        .update({
          status: 'completed',
          output: output as string,
          executed_at: new Date().toISOString()
        })
        .eq('id', commandRecord.id)

      return new Response(
        JSON.stringify({ success: true, output }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )

    } catch (sshError) {
      console.error('SSH Error:', sshError)
      console.error('SSH Error Stack:', sshError.stack)
      
      // Update command status to error
      await supabaseClient
        .from('server_commands')
        .update({
          status: 'error',
          output: sshError.message,
          executed_at: new Date().toISOString()
        })
        .eq('id', commandRecord.id)
      
      return new Response(
        JSON.stringify({ 
          error: sshError.message,
          details: sshError.stack
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    } finally {
      ssh.end()
    }

  } catch (error) {
    console.error('Error:', error)
    console.error('Error Stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})