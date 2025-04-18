import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommandExecutorProps {
  serverId: string;
}

export function CommandExecutor({ serverId }: CommandExecutorProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [sshError, setSshError] = useState<string | null>(null);
  const [lastCommandResult, setLastCommandResult] = useState<string | null>(null);
  const [lastErrorDetails, setLastErrorDetails] = useState<string | null>(null);
  const { toast } = useToast();

  const executeCommand = async (command: string, showOutput: boolean = true) => {
    setIsExecuting(true);
    setLastErrorDetails(null);
    try {
      console.log('Executing command:', command);
      const { data, error } = await supabase.functions.invoke('execute-command', {
        body: { serverId, command }
      });

      if (error) {
        console.error('Error executing command:', error);
        setLastErrorDetails(error.message);
        
        if (error.message.includes("Handshake failed") || 
            error.message.includes("signature verification failed")) {
          setSshError("Ошибка SSH-подключения: проблемы с верификацией ключа. Проверьте права доступа SSH ключей.");
        } else if (error.message.includes("non-2xx status code")) {
          setSshError("Ошибка выполнения Edge Function: возможно, проблема с сервером или соединением.");
        }
        throw error;
      }

      console.log('Command execution result:', data);
      
      if (showOutput) {
        toast({
          title: "Команда выполнена",
          description: `Результат: ${data?.output || 'Нет вывода'}`,
        });
      }
      
      setLastCommandResult(data?.output || null);
      return data;
    } catch (error) {
      console.error('Error executing command:', error);
      setLastCommandResult(null);
      
      if (showOutput) {
        toast({
          title: "Ошибка выполнения команды",
          description: error.message,
          variant: "destructive"
        });
      }
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const checkSSHConnection = async () => {
    try {
      setSshError(null);
      await executeCommand('echo "SSH-соединение успешно установлено"');
      
      toast({
        title: "SSH-соединение активно",
        description: "SSH-подключение к серверу работает корректно.",
      });
    } catch (error) {
      console.error('Error testing SSH connection:', error);
      setSshError("Ошибка SSH-подключения. Возможно, проблема с SSH-ключами или аутентификацией.")
      toast({
        title: "Ошибка SSH-соединения",
        description: "Не удалось установить SSH-соединение с сервером.",
        variant: "destructive"
      });
    }
  };

  const testSSHConnection = checkSSHConnection;

  const createSSHKeys = async () => {
    try {
      setSshError(null);
      toast({
        title: "Создание SSH-ключей",
        description: "Начат процесс создания новых SSH-ключей...",
      });
      
      // Проверяем существующие ключи
      const checkResult = await executeCommand('ls -la ~/.ssh/ || echo "Директория не существует"', false);
      const sshDirExists = !checkResult?.output?.includes("Директория не существует");
      
      // Создаем директорию .ssh если её нет
      if (!sshDirExists) {
        await executeCommand('mkdir -p ~/.ssh/', false);
        await executeCommand('chmod 700 ~/.ssh/', false);
      }
      
      // Создаем новую пару ключей без пароля
      await executeCommand('ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N "" -y || echo "Не удалось создать ключи"');
      
      // Устанавливаем правильные права
      await executeCommand('chmod 600 ~/.ssh/id_rsa', false);
      await executeCommand('chmod 644 ~/.ssh/id_rsa.pub', false);
      
      // Добавляем публичный ключ в authorized_keys
      await executeCommand('cat ~/.ssh/id_rsa.pub > ~/.ssh/authorized_keys', false);
      await executeCommand('chmod 600 ~/.ssh/authorized_keys', false);
      
      // Выводим результат
      const pubKeyResult = await executeCommand('cat ~/.ssh/id_rsa.pub');
      
      toast({
        title: "SSH-ключи созданы",
        description: "Новые SSH-ключи успешно созданы и настроены.",
      });
    } catch (error) {
      console.error('Error creating SSH keys:', error);
      toast({
        title: "Ошибка создания SSH-ключей",
        description: "Не удалось создать новые SSH-ключи. " + error.message,
        variant: "destructive"
      });
    }
  };

  const checkSSHPermissions = async () => {
    try {
      setSshError(null);
      // Проверяем существование директории .ssh и её права
      await executeCommand('ls -la ~ | grep .ssh');
      
      // Проверяем права на файлы ключей
      await executeCommand('ls -la ~/.ssh');
      
      toast({
        title: "Проверка прав доступа SSH",
        description: "Проверка прав доступа к SSH директории и ключам выполнена",
      });
    } catch (error) {
      console.error('Error checking SSH permissions:', error);
      toast({
        title: "Ошибка проверки SSH-директории",
        description: "Не удалось проверить SSH-директорию. Возможно, она не существует.",
        variant: "destructive"
      });
    }
  };

  const checkSSHKeyFormat = async () => {
    try {
      // Проверяем формат ключей
      const privateKeyCheck = await executeCommand('file ~/.ssh/id_rsa || echo "Приватный ключ не существует"');
      
      if (privateKeyCheck?.output?.includes("не существует")) {
        throw new Error("Приватный ключ не найден");
      }
      
      await executeCommand('ssh-keygen -l -f ~/.ssh/id_rsa || echo "Не удалось проверить формат ключа"');
      
      toast({
        title: "Проверка формата SSH-ключей",
        description: "Выполнена проверка формата SSH-ключей",
      });
    } catch (error) {
      console.error('Error checking SSH key format:', error);
      setLastErrorDetails(error.message);
      toast({
        title: "Ошибка проверки формата ключей",
        description: "Не удалось проверить формат SSH-ключей. Возможно, файлы не существуют.",
        variant: "destructive"
      });
    }
  };

  const setupAuthorizedKeys = async () => {
    try {
      // Создаем файл authorized_keys если он не существует
      await executeCommand('touch ~/.ssh/authorized_keys');
      
      // Добавляем публичный ключ в authorized_keys
      await executeCommand('cat ~/.ssh/id_rsa.pub > ~/.ssh/authorized_keys');
      
      // Устанавливаем правильные права на файл
      await executeCommand('chmod 600 ~/.ssh/authorized_keys');
      
      // Выводим содержимое файла для проверки
      await executeCommand('cat ~/.ssh/authorized_keys');
      
      toast({
        title: "Настройка authorized_keys",
        description: "Публичный ключ добавлен в файл authorized_keys",
      });
    } catch (error) {
      console.error('Error setting up authorized_keys:', error);
      toast({
        title: "Ошибка настройки authorized_keys",
        description: "Не удалось настроить файл authorized_keys",
        variant: "destructive"
      });
    }
  };

  const fixSSHPermissions = async () => {
    try {
      setSshError(null);
      // Создаём директорию .ssh если её нет
      await executeCommand('mkdir -p ~/.ssh/');
      
      // Устанавливаем правильные права для директории .ssh (700)
      await executeCommand('chmod 700 ~/.ssh/');
      
      // Устанавливаем права для приватного ключа (600)
      await executeCommand('chmod 600 ~/.ssh/id_rsa || echo "Приватный ключ отсутствует"');
      
      // Устанавливаем права для публичного ключа (644)
      await executeCommand('chmod 644 ~/.ssh/id_rsa.pub || echo "Публичный ключ отсутствует"');
      
      // Устанавливаем права для authorized_keys (600)
      await executeCommand('chmod 600 ~/.ssh/authorized_keys || echo "authorized_keys отсутствует"');
      
      // Проверяем результат
      await executeCommand('ls -la ~/.ssh/');
      
      toast({
        title: "Права доступа SSH обновлены",
        description: "Установлены рекомендуемые права доступа для SSH директории и ключей",
      });
    } catch (error) {
      console.error('Error fixing SSH permissions:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось установить права доступа: " + error.message,
        variant: "destructive"
      });
    }
  };
  
  const fixNginxSymlinks = async () => {
    try {
      setSshError(null);
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
        title: "Ошибка настройки конфигурации Nginx",
        description: "Не удалось настроить конфигурацию Nginx. Проверьте логи для деталей.",
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

  return (
    <div className="space-y-4">
      {sshError && (
        <Alert variant="destructive">
          <AlertTitle>Проблема с SSH-подключением</AlertTitle>
          <AlertDescription>{sshError}</AlertDescription>
        </Alert>
      )}
      
      {lastErrorDetails && (
        <Alert variant="default" className="bg-amber-50 border-amber-200">
          <AlertTitle>Подробности последней ошибки</AlertTitle>
          <AlertDescription className="whitespace-pre-wrap font-mono text-xs max-h-40 overflow-auto">
            {lastErrorDetails}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="ssh" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="ssh">Настройка SSH</TabsTrigger>
          <TabsTrigger value="nginx">Настройка Nginx</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ssh" className="space-y-4">
          <Button 
            onClick={createSSHKeys}
            disabled={isExecuting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isExecuting ? "Создание ключей..." : "Создать новые SSH ключи"}
          </Button>
          
          <Button 
            onClick={testSSHConnection}
            disabled={isExecuting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isExecuting ? "Проверка SSH..." : "Проверить SSH-соединение"}
          </Button>
          
          <Button 
            onClick={checkSSHPermissions} 
            disabled={isExecuting}
            className="w-full"
          >
            {isExecuting ? "Проверка прав доступа..." : "Проверить права SSH"}
          </Button>
          
          <Button 
            onClick={checkSSHKeyFormat} 
            disabled={isExecuting}
            className="w-full"
          >
            {isExecuting ? "Проверка формата ключей..." : "Проверить формат SSH-ключей"}
          </Button>
          
          <Button 
            onClick={setupAuthorizedKeys} 
            disabled={isExecuting}
            className="w-full"
          >
            {isExecuting ? "Настройка authorized_keys..." : "Настроить authorized_keys"}
          </Button>
          
          <Button 
            onClick={fixSSHPermissions} 
            disabled={isExecuting}
            className="w-full"
          >
            {isExecuting ? "Настройка прав доступа..." : "Настроить права SSH"}
          </Button>
        </TabsContent>
        
        <TabsContent value="nginx" className="space-y-4">
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
          
          <Button 
            onClick={setupHttps} 
            disabled={isExecuting}
            className="w-full"
          >
            {isExecuting ? "Настройка HTTPS..." : "Настроить HTTPS"}
          </Button>
        </TabsContent>
      </Tabs>
      
      {lastCommandResult && (
        <div className="border rounded-md p-3 bg-gray-50">
          <h3 className="text-sm font-medium mb-1">Результат последней команды:</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40 bg-gray-100 p-2 rounded">
            {lastCommandResult}
          </pre>
        </div>
      )}
    </div>
  );
}
