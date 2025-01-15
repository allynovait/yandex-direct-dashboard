import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { command, serverId } = await req.json()
    
    console.log('Executing command:', command, 'on server:', serverId)

    if (!serverId) {
      throw new Error('Server ID is required')
    }

    // Get server information
    const { data: server, error: serverError } = await supabaseClient
      .from('servers')
      .select('*')
      .eq('id', serverId)
      .single()

    console.log('Server lookup result:', server ? 'Found' : 'Not found', 'Error:', serverError)

    if (serverError) {
      throw new Error(`Failed to fetch server details: ${serverError.message}`)
    }

    if (!server) {
      throw new Error('Server not found')
    }

    // Create command record
    const { data: commandRecord, error: commandError } = await supabaseClient
      .from('server_commands')
      .insert({
        server_id: serverId,
        command: command,
        status: 'executing'
      })
      .select()
      .single()

    if (commandError) {
      throw new Error(`Failed to create command record: ${commandError.message}`)
    }

    console.log('Command record created:', commandRecord.id)

    // Here would be the actual SSH command execution
    // For now, we're just simulating it
    const output = `Executed command: ${command}`

    // Update command status
    const { error: updateError } = await supabaseClient
      .from('server_commands')
      .update({
        status: 'completed',
        output: output,
        executed_at: new Date().toISOString()
      })
      .eq('id', commandRecord.id)

    if (updateError) {
      throw new Error(`Failed to update command status: ${updateError.message}`)
    }

    console.log('Command execution completed successfully')

    return new Response(
      JSON.stringify({ success: true, output }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error executing command:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})