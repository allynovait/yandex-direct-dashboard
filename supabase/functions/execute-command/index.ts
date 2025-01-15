import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Client } from "https://deno.land/x/ssh2@1.3.0/mod.ts";

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

    // Получаем список всех серверов
    console.log('Checking all servers with service role...')
    const { data: allServers, error: allServersError } = await supabaseClient
      .from('servers')
      .select('*')
    
    if (allServersError) {
      console.error('Error fetching all servers:', allServersError)
      throw new Error(`Ошибка при получении списка серверов: ${allServersError.message}`)
    }

    if (!allServers || allServers.length === 0) {
      console.error('No servers found in database')
      throw new Error('В базе данных нет серверов')
    }

    console.log('All servers in database:', JSON.stringify(allServers, null, 2))

    // Берем первый сервер для тестирования
    const server = allServers[0]
    console.log('Selected server for testing:', JSON.stringify(server, null, 2))

    const testCommand = {
      serverId: server.id,
      command: "uptime"
    }

    // Создаем запись о команде
    console.log('Creating command record...')
    let commandRecord;
    try {
      const { data, error } = await supabaseClient
        .from('server_commands')
        .insert({
          server_id: testCommand.serverId,
          command: testCommand.command,
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

    // Выполняем SSH команду
    console.log('Executing SSH command...')
    const ssh = new Client();
    
    try {
      await new Promise((resolve, reject) => {
        ssh.on('ready', () => {
          console.log('SSH connection established')
          ssh.exec(testCommand.command, (err, stream) => {
            if (err) {
              console.error('SSH exec error:', err)
              reject(err)
              return
            }

            let output = ''
            stream.on('data', (data: Buffer) => {
              output += data.toString()
            })

            stream.on('end', () => {
              console.log('Command output:', output)
              resolve(output)
            })

            stream.on('error', (err) => {
              console.error('Stream error:', err)
              reject(err)
            })
          })
        })

        ssh.on('error', (err) => {
          console.error('SSH connection error:', err)
          reject(err)
        })

        // Подключаемся к серверу
        ssh.connect({
          host: server.host,
          username: server.ssh_username,
          privateKey: server.ssh_private_key
        })
      })
      .then(async (output) => {
        // Обновляем статус команды на успешный
        const { error: updateError } = await supabaseClient
          .from('server_commands')
          .update({
            status: 'completed',
            output: output as string,
            executed_at: new Date().toISOString()
          })
          .eq('id', commandRecord.id)

        if (updateError) {
          console.error('Error updating command status:', updateError)
          throw updateError
        }

        console.log('Command execution completed successfully')
        return output
      })
      .catch(async (error) => {
        // Обновляем статус команды на ошибку
        const { error: updateError } = await supabaseClient
          .from('server_commands')
          .update({
            status: 'error',
            output: error.message,
            executed_at: new Date().toISOString()
          })
          .eq('id', commandRecord.id)

        if (updateError) {
          console.error('Error updating command status:', updateError)
        }
        throw error
      })
      .finally(() => {
        ssh.end()
      })

    } catch (sshError) {
      console.error('SSH execution error:', sshError)
      throw new Error(`Ошибка выполнения SSH команды: ${sshError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
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