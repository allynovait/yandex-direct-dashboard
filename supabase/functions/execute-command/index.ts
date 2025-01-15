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
    // Initialize Supabase client
    console.log('Initializing Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json()
      console.log('Request body received:', JSON.stringify(requestBody))
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      throw new Error('Ошибка при чтении данных запроса')
    }

    const { command, serverId } = requestBody
    
    console.log('Parsed command data:', { command, serverId })

    if (!serverId) {
      const error = 'ID сервера не указан'
      console.error(error)
      throw new Error(error)
    }

    // Get server information
    let serverResult;
    try {
      serverResult = await supabaseClient
        .from('servers')
        .select('*')
        .eq('id', serverId)
        .maybeSingle()
      
      console.log('Server lookup result:', {
        success: !!serverResult.data,
        error: serverResult.error?.message || null,
        serverId,
        data: serverResult.data ? JSON.stringify(serverResult.data) : null
      })
    } catch (serverError) {
      console.error('Error fetching server:', serverError)
      throw new Error(`Ошибка при получении данных сервера: ${serverError.message}`)
    }

    if (serverResult.error) {
      console.error('Server lookup error:', serverResult.error)
      throw new Error(`Ошибка при получении данных сервера: ${serverResult.error.message}`)
    }

    if (!serverResult.data) {
      const error = `Сервер с ID ${serverId} не найден`
      console.error(error)
      throw new Error(error)
    }

    // Create command record
    let commandRecord;
    try {
      const { data, error } = await supabaseClient
        .from('server_commands')
        .insert({
          server_id: serverId,
          command: command,
          status: 'executing'
        })
        .select()
        .single()

      if (error) throw error
      commandRecord = data

      console.log('Command record created:', {
        commandId: commandRecord.id,
        serverId: commandRecord.server_id,
        command: commandRecord.command
      })
    } catch (commandError) {
      console.error('Error creating command record:', commandError)
      throw new Error(`Ошибка при создании записи команды: ${commandError.message}`)
    }

    // Here would be the actual SSH command execution
    // For now, we're just simulating it
    const output = `Выполнена команда: ${command}`

    // Update command status
    try {
      const { error: updateError } = await supabaseClient
        .from('server_commands')
        .update({
          status: 'completed',
          output: output,
          executed_at: new Date().toISOString()
        })
        .eq('id', commandRecord.id)

      if (updateError) throw updateError

      console.log('Command execution completed successfully:', {
        commandId: commandRecord.id,
        status: 'completed',
        output
      })
    } catch (updateError) {
      console.error('Error updating command status:', updateError)
      throw new Error(`Ошибка при обновлении статуса команды: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, output }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error executing command:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
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