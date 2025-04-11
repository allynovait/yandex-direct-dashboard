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
      // Проверяем существование директории .ssh и её права
      await executeCommand('ls -la ~ | grep .ssh');
      
      // Создаём директорию .ssh если её нет
      await executeCommand('mkdir -p ~/.ssh');
      
      // Устанавливаем правильные права для директории .ssh (700)
      await executeCommand('chmod 700 ~/.ssh');
      
      // Проверяем права на файлы ключей
      await executeCommand('ls -la ~/.ssh');
      
      toast({
        title: "Проверка прав доступа SSH",
        description: "Начата проверка прав доступа к SSH директории и ключам",
      });
    } catch (error) {
      console.error('Error checking SSH permissions:', error);
    }
  };

  const fixSSHPermissions = async () => {
    try {
      // Создаём директорию .ssh если её нет
      await executeCommand('mkdir -p ~/.ssh');
      
      // Устанавливаем правильные права для директории .ssh (700)
      await executeCommand('chmod 700 ~/.ssh');
      
      // Устанавливаем права для приватного ключа (600)
      await executeCommand('chmod 600 ~/.ssh/id_rsa');
      
      // Устанавливаем права для публичного ключа (644)
      await executeCommand('chmod 644 ~/.ssh/id_rsa.pub');
      
      // Устанавливаем права для authorized_keys (600)
      await executeCommand('chmod 600 ~/.ssh/authorized_keys');
      
      // Проверяем результат
      await executeCommand('ls -la ~/.ssh');
      
      toast({
        title: "Права доступа SSH обновлены",
        description: "Установлены рекомендуемые права доступа для SSH директории и ключей",
      });
    } catch (error) {
      console.error('Error fixing SSH permissions:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось установить права доступа",
        variant: "destructive"
      });
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

  const fixNginxSymlinks = async () => {
    try {
      // Проверяем текущее состояние символических ссылок
      await executeCommand('sudo ls -la /etc/nginx/sites-enabled/');
      
      // Удаляем проблемную символическую ссылку ln, если она существует
      await executeCommand('sudo rm -f /etc/nginx/sites-enabled/ln');
      
      // Удаляем существующую символическую ссылку yandex-dashboard, чтобы избежать ошибки "File exists"
      await executeCommand('sudo rm -f /etc/nginx/sites-enabled/yandex-dashboard');
      
      // Создаем правильную символическую ссылку
      await executeCommand('sudo ln -s /etc/nginx/sites-available/yandex-dashboard /etc/nginx/sites-enabled/');
      
      // Проверяем конфигурацию Nginx
      await executeCommand('sudo nginx -t');
      
      // Перезапускаем Nginx
      await executeCommand('sudo systemctl restart nginx');
      
      toast({
        title: "Символические ссылки Nginx исправлены",
        description: "Проблема с символическими ссылками Nginx должна быть исправлена. Проверьте статус Nginx.",
      });
    } catch (error) {
      console.error('Error fixing Nginx symlinks:', error);
      toast({
        title: "Ошибка исправления символических ссылок",
        description: "Не удалось исправить символические ссылки Nginx. Проверьте права доступа и состояние системы.",
        variant: "destructive"
      });
    }
  };

  const setupNginxConfig = async () => {
    try {
      // Создаем директорию sites-available, если ее нет
      await executeCommand('sudo mkdir -p /etc/nginx/sites-available');
      
      // Создаем директорию sites-enabled, если ее нет
      await executeCommand('sudo mkdir -p /etc/nginx/sites-enabled');
      
      // Копируем пример конфигурации в нужное место
      await executeCommand('sudo cp nginx-config-example.txt /etc/nginx/sites-available/yandex-dashboard');
      
      // Удаляем старую символическую ссылку, если она существует
      await executeCommand('sudo rm -f /etc/nginx/sites-enabled/yandex-dashboard');
      
      // Создаем новую символическую ссылку
      await executeCommand('sudo ln -s /etc/nginx/sites-available/yandex-dashboard /etc/nginx/sites-enabled/');
      
      // Удаляем дефолтную конфигурацию, если она конфликтует
      await executeCommand('sudo rm -f /etc/nginx/sites-enabled/default');
      
      // Проверяем конфигурацию
      await executeCommand('sudo nginx -t');
      
      // Перезапускаем Nginx
      await executeCommand('sudo systemctl restart nginx');
      
      toast({
        title: "Конфигурация Nginx настроена",
        description: "Конфигурация Nginx установлена и активирована. Проверьте работу сервера.",
      });
    } catch (error) {
      console.error('Error setting up Nginx config:', error);
      toast({
        title: "Ошиб��а настройки конфигурации Nginx",
        description: "Не удалось настроить конфигурацию Nginx. Проверьте логи для деталей.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={checkSSHPermissions} 
        disabled={isExecuting}
        className="w-full"
      >
        {isExecuting ? "Проверка прав доступа..." : "Проверить права SSH"}
      </Button>
      <Button 
        onClick={fixSSHPermissions} 
        disabled={isExecuting}
        className="w-full"
      >
        {isExecuting ? "Настройка прав доступа..." : "Настроить права SSH"}
      </Button>
      <Button 
        onClick={setupHttps} 
        disabled={isExecuting}
        className="w-full"
      >
        {isExecuting ? "Настройка HTTPS..." : "Настроить HTTPS"}
      </Button>
      <Button 
        onClick={fixNginxSymlinks} 
        disabled={isExecuting}
        className="w-full"
      >
        {isExecuting ? "Исправление символических ссылок..." : "Исправить символические ссылки Nginx"}
      </Button>
      <Button 
        onClick={setupNginxConfig} 
        disabled={isExecuting}
        className="w-full"
      >
        {isExecuting ? "Настройка конфигурации Nginx..." : "Настроить конфигурацию Nginx"}
      </Button>
    </div>
  );
}
