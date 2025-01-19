import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Client } from "npm:ssh2@1.11.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
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
      throw new Error('Server ID and command are required')
    }

    console.log('Executing command:', command)

    const { data: server, error: serverError } = await supabaseClient
      .from('servers')
      .select('*')
      .eq('id', serverId)
      .single()

    if (serverError || !server) {
      throw new Error(`Server not found: ${serverError?.message}`)
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
      throw new Error(`Failed to create command record: ${commandError.message}`)
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
              const chunk = data.toString()
              console.log('Stream data:', chunk)
              output += chunk
            })

            stream.stderr.on('data', (data: Buffer) => {
              const chunk = data.toString()
              console.error('Stream error:', chunk)
              errorOutput += chunk
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

        // Обработка приватного ключа
        let privateKey = server.ssh_private_key || '';
        
        // Проверяем, содержит ли ключ заголовки
        const hasHeaders = privateKey.includes('-----BEGIN') && privateKey.includes('-----END');
        
        // Если заголовков нет, пробуем использовать ключ как есть
        if (!hasHeaders) {
          console.log('Using raw private key without headers');
        } else {
          // Если заголовки есть, форматируем ключ правильно
          privateKey = privateKey
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
        }

        console.log('Attempting SSH connection to:', server.host)

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
              'diffie-hellman-group-exchange-sha256'
            ],
            serverHostKey: [
              'ssh-rsa',
              'rsa-sha2-256',
              'rsa-sha2-512',
              'ecdsa-sha2-nistp256',
              'ecdsa-sha2-nistp384',
              'ecdsa-sha2-nistp521'
            ],
            cipher: [
              'aes128-gcm',
              'aes256-gcm',
              'aes128-ctr',
              'aes192-ctr',
              'aes256-ctr'
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
      
      // Update command status to error
      await supabaseClient
        .from('server_commands')
        .update({
          status: 'error',
          output: sshError.message,
          executed_at: new Date().toISOString()
        })
        .eq('id', commandRecord.id)
      
      throw sshError
    } finally {
      ssh.end()
    }

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})