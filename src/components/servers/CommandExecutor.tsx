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
        title: "Command executed",
        description: `Output: ${data?.output || 'No output'}`,
      });

      return data;
    } catch (error) {
      console.error('Error executing command:', error);
      toast({
        title: "Error executing command",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const setupHttps = async () => {
    try {
      // Step 1: Update and install certbot
      await executeCommand('sudo apt-get update && sudo apt-get install -y certbot');
      
      // Step 2: Stop the Node.js server to free port 80
      await executeCommand('sudo pm2 stop all');
      
      // Step 3: Get the certificate (using --standalone since we don't have nginx)
      await executeCommand('sudo certbot certonly --standalone --agree-tos --non-interactive -d 89.223.70.180 --register-unsafely-without-email');
      
      // Step 4: Start the server back
      await executeCommand('sudo pm2 start all');
      
      toast({
        title: "HTTPS Setup Complete",
        description: "HTTPS has been successfully configured on the server.",
      });
    } catch (error) {
      console.error('Error during HTTPS setup:', error);
      toast({
        title: "HTTPS Setup Failed",
        description: "Failed to setup HTTPS. Please check the logs for details.",
        variant: "destructive"
      });
      
      // Try to restart the server in case of failure
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
        onClick={setupHttps} 
        disabled={isExecuting}
      >
        {isExecuting ? "Setting up HTTPS..." : "Setup HTTPS"}
      </Button>
    </div>
  );
}