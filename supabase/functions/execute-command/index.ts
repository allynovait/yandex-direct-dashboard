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
    // Initialize Supabase client with detailed logging
    console.log('Initializing Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false
        }
      }
    )
    console.log('Supabase client initialized successfully')

    // Parse request body with validation
    let requestBody;
    try {
      requestBody = await req.json()
      console.log('Request body received:', JSON.stringify(requestBody))
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      throw new Error('Ошибка при чтении данных запроса')
    }

    const { command, serverId } = requestBody
    
    console.log('Validating request data:', { command, serverId })

    if (!serverId) {
      const error = 'ID сервера не указан'
      console.error('Missing server ID:', error)
      throw new Error(error)
    }

    if (!command) {
      const error = 'Команда не указана'
      console.error('Missing command:', error)
      throw new Error(error)
    }

    // Get server information with detailed logging
    console.log('Preparing server query for ID:', serverId)
    const query = supabaseClient
      .from('servers')
      .select('*')
      .eq('id', serverId)
    
    console.log('Executing query:', query.toSQL())
    
    const { data: servers, error: serversError } = await query

    console.log('Server lookup result:', {
      success: !!servers,
      error: serversError?.message || null,
      serverId,
      serversCount: servers?.length || 0,
      query: query.toSQL()
    })

    if (serversError) {
      console.error('Server lookup error:', serversError)
      throw new Error(`Ошибка при получении данных сервера: ${serversError.message}`)
    }

    if (!servers || servers.length === 0) {
      const error = `Сервер с ID ${serverId} не найден`
      console.error('Server not found:', { serverId, error })
      throw new Error(error)
    }

    const server = servers[0]
    console.log('Server found:', { 
      serverId: server.id,
      name: server.name,
      host: server.host
    })

    // Create command record with logging
    console.log('Creating command record...')
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

      if (error) {
        console.error('Error creating command record:', error)
        throw error
      }
      
      commandRecord = data
      console.log('Command record created successfully:', {
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
    console.log('Command execution completed:', { output })

    // Update command status with logging
    try {
      console.log('Updating command status...')
      const { error: updateError } = await supabaseClient
        .from('server_commands')
        .update({
          status: 'completed',
          output: output,
          executed_at: new Date().toISOString()
        })
        .eq('id', commandRecord.id)

      if (updateError) {
        console.error('Error updating command status:', updateError)
        throw updateError
      }

      console.log('Command status updated successfully')
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
      JSON.stringify({ 
        error: error.message,
        details: {
          stack: error.stack,
          cause: error.cause
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})