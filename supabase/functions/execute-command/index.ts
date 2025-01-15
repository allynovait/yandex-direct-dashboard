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

    // Log request body for debugging
    const requestBody = await req.json()
    console.log('Request body:', JSON.stringify(requestBody))

    const { command, serverId } = requestBody
    
    console.log('Executing command:', command, 'on server:', serverId)

    if (!serverId) {
      const error = 'ID сервера не указан'
      console.error(error)
      throw new Error(error)
    }

    // Get server information using maybeSingle() instead of single()
    const { data: server, error: serverError } = await supabaseClient
      .from('servers')
      .select('*')
      .eq('id', serverId)
      .maybeSingle()

    console.log('Server lookup result:', {
      serverFound: !!server,
      serverError: serverError?.message,
      serverId,
      serverDetails: server ? JSON.stringify(server) : null
    })

    if (serverError) {
      console.error('Server lookup error:', serverError)
      throw new Error(`Ошибка при получении данных сервера: ${serverError.message}`)
    }

    if (!server) {
      const error = `Сервер с ID ${serverId} не найден`
      console.error(error)
      throw new Error(error)
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
      console.error('Command creation error:', commandError)
      throw new Error(`Ошибка при создании записи команды: ${commandError.message}`)
    }

    console.log('Command record created:', {
      commandId: commandRecord.id,
      serverId: commandRecord.server_id,
      command: commandRecord.command
    })

    // Here would be the actual SSH command execution
    // For now, we're just simulating it
    const output = `Выполнена команда: ${command}`

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
      console.error('Command status update error:', updateError)
      throw new Error(`Ошибка при обновлении статуса команды: ${updateError.message}`)
    }

    console.log('Command execution completed successfully:', {
      commandId: commandRecord.id,
      status: 'completed',
      output
    })

    return new Response(
      JSON.stringify({ success: true, output }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error executing command:', {
      error: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})