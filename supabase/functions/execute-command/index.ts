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
    console.log('Initializing Supabase client...')
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
    console.log('Supabase client initialized successfully')

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

    // Проверяем все серверы для отладки
    console.log('Checking all servers with service role...')
    const { data: allServers, error: allServersError } = await supabaseClient
      .from('servers')
      .select('id, name, host')
    
    console.log('All servers in database:', allServers)
    if (allServersError) {
      console.error('Error fetching all servers:', allServersError)
    }

    // Получаем информацию о конкретном сервере
    console.log('Fetching specific server details for ID:', serverId)
    const { data: server, error: serverError } = await supabaseClient
      .from('servers')
      .select('*')
      .eq('id', serverId)
      .maybeSingle()

    console.log('Server lookup result:', {
      success: !!server,
      error: serverError?.message || null,
      serverId,
      serverFound: !!server,
      serverDetails: server ? { id: server.id, name: server.name, host: server.host } : null
    })

    if (serverError) {
      console.error('Server lookup error:', serverError)
      throw new Error(`Ошибка при получении данных сервера: ${serverError.message}`)
    }

    if (!server) {
      const error = `Сервер с ID ${serverId} не найден`
      console.error('Server not found:', { serverId, error })
      throw new Error(error)
    }

    // Создаем запись о команде
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

    // Здесь будет выполнение SSH команды
    // Пока просто симулируем
    const output = `Выполнена команда: ${command}`
    console.log('Command execution completed:', { output })

    // Обновляем статус команды
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