import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CommandExecutorProps {
  serverId: string;
}

export function CommandExecutor({ serverId }: CommandExecutorProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();

  const executeCommand = async (command: string) => {
    setIsExecuting(true);
    try {
      console.log('Executing command:', command);
      const { data, error } = await supabase.functions.invoke('execute-command', {
        body: { serverId, command }
      });

      if (error) {
        console.error('Error executing command:', error);
        throw error;
      }

      console.log('Command execution result:', data);
      toast({
        title: "Команда выполнена",
        description: `Результат: ${data?.output || 'Нет вывода'}`,
      });

      return data;
    } catch (error) {
      console.error('Error executing command:', error);
      toast({
        title: "Ошибка выполнения команды",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const checkSSHPermissions = async () => {
    try {
      // Проверяем существование директории .ssh
      await executeCommand('ls -la ~/.ssh');
      
      // Проверяем права доступа к файлам в .ssh
      await executeCommand('ls -la /root/.ssh/test*');
      
      toast({
        title: "Проверка SSH ключей",
        description: "Проверка прав доступа к SSH ключам запущена",
      });
    } catch (error) {
      console.error('Error checking SSH permissions:', error);
    }
  };

  const setupHttps = async () => {
    try {
      // Step 1: Stop all PM2 processes to free port 80
      await executeCommand('sudo pm2 stop all');
      toast({
        title: "Server stopped",
        description: "Successfully stopped all server processes",
      });
      
      // Step 2: Update and install certbot
      await executeCommand('sudo apt-get update && sudo apt-get install -y certbot');
      
      // Step 3: Get the certificate (using --standalone since we don't have nginx)
      await executeCommand('sudo certbot certonly --standalone --agree-tos --non-interactive -d allynovaittest.site --register-unsafely-without-email');
      
      // Step 4: Verify certificate exists
      await executeCommand('ls -la /etc/letsencrypt/live/allynovaittest.site/');
      
      // Step 5: Set correct permissions for certificate files
      await executeCommand('sudo chown -R root:root /etc/letsencrypt/live/allynovaittest.site/');
      await executeCommand('sudo chmod -R 755 /etc/letsencrypt/live/allynovaittest.site/');
      
      // Step 6: Start the server back with new configuration
      await executeCommand('sudo pm2 start all');
      
      // Step 7: Verify HTTPS is working by checking the port
      await executeCommand('sudo netstat -tulpn | grep LISTEN');
      
      toast({
        title: "HTTPS Setup Complete",
        description: "HTTPS has been successfully configured on the server.",
      });
    } catch (error) {
      console.error('Error during HTTPS setup:', error);
      toast({
        title: "Ошибка настройки HTTPS",
        description: "Не удалось настроить HTTPS. Проверьте логи для деталей.",
        variant: "destructive"
      });
      
      // Пытаемся перезапустить сервер в случае ошибки
      try {
        await executeCommand('sudo pm2 start all');
      } catch (restartError) {
        console.error('Error restarting server:', restartError);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={checkSSHPermissions} 
        disabled={isExecuting}
        className="w-full"
      >
        {isExecuting ? "Проверка прав доступа..." : "Проверить права SSH ключей"}
      </Button>
      <Button 
        onClick={setupHttps} 
        disabled={isExecuting}
        className="w-full"
      >
        {isExecuting ? "Настройка HTTPS..." : "Настроить HTTPS"}
      </Button>
    </div>
  );
}