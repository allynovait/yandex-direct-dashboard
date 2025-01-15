import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AddServerForm } from "@/components/servers/AddServerForm";
import { ServerList } from "@/components/servers/ServerList";
import { CommandExecutor } from "@/components/servers/CommandExecutor";
import { CommandHistory } from "@/components/servers/CommandHistory";

interface Server {
  id: string;
  name: string;
  host: string;
  created_at: string;
  ssh_username: string;
  ssh_private_key: string | null;
  ssh_public_key: string | null;
}

interface Command {
  id: string;
  server_id: string;
  command: string;
  status: string;
  output: string | null;
  executed_at: string | null;
  created_at: string;
}

export default function Servers() {
  const { toast } = useToast();
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [command, setCommand] = useState("");

  const { data: servers, isLoading: serversLoading, refetch: refetchServers } = useQuery({
    queryKey: ["servers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("servers").select("*");
      if (error) throw error;
      return data as Server[];
    },
  });

  const { data: commands, isLoading: commandsLoading, refetch: refetchCommands } = useQuery({
    queryKey: ["commands", selectedServer],
    queryFn: async () => {
      if (!selectedServer) return [];
      const { data, error } = await supabase
        .from("server_commands")
        .select("*")
        .eq("server_id", selectedServer)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Command[];
    },
    enabled: !!selectedServer,
  });

  const executeCommand = async () => {
    if (!selectedServer || !command.trim()) {
      toast({
        title: "Ошибка",
        description: "Выберите сервер и введите команду",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("execute-command", {
        body: { serverId: selectedServer, command: command.trim() },
      });

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Команда отправлена на выполнение",
      });

      setCommand("");
      refetchCommands();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить команду",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <AddServerForm onServerAdded={refetchServers} />
      <ServerList
        servers={servers}
        isLoading={serversLoading}
        selectedServer={selectedServer}
        onSelectServer={setSelectedServer}
      />
      {selectedServer && (
        <>
          <CommandExecutor
            command={command}
            onCommandChange={setCommand}
            onExecuteCommand={executeCommand}
          />
          <CommandHistory commands={commands} isLoading={commandsLoading} />
        </>
      )}
    </div>
  );
}