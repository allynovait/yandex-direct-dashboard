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

    // Получаем информацию о сервере
    const { data: server, error: serverError } = await supabaseClient
      .from('servers')
      .select('*')
      .eq('id', serverId)
      .single()

    if (serverError || !server) {
      throw new Error('Сервер не найден')
    }

    // Создаем запись о команде
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
      throw new Error('Ошибка при создании записи о команде')
    }

    // Здесь будет логика выполнения команды на сервере
    // В реальном приложении здесь нужно использовать SSH для подключения к серверу
    const output = `Выполнена команда: ${command}`

    // Обновляем статус команды
    const { error: updateError } = await supabaseClient
      .from('server_commands')
      .update({
        status: 'completed',
        output: output,
        executed_at: new Date().toISOString()
      })
      .eq('id', commandRecord.id)

    if (updateError) {
      throw new Error('Ошибка при обновлении статуса команды')
    }

    return new Response(
      JSON.stringify({ success: true, output }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})