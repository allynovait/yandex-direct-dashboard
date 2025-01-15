import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export function AddServerForm({ onServerAdded }: { onServerAdded: () => void }) {
  const { toast } = useToast();
  const [newServer, setNewServer] = useState({
    name: "",
    host: "",
    ssh_username: "root",
    ssh_private_key: "",
    ssh_public_key: "",
  });

  const handleAddServer = async () => {
    if (!newServer.name || !newServer.host) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("servers").insert([newServer]);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить сервер",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Успех",
      description: "Сервер успешно добавлен",
    });

    setNewServer({
      name: "",
      host: "",
      ssh_username: "root",
      ssh_private_key: "",
      ssh_public_key: "",
    });
    onServerAdded();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    keyType: "private" | "public"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setNewServer({
        ...newServer,
        [keyType === "private" ? "ssh_private_key" : "ssh_public_key"]: content,
      });
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить новый сервер</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название сервера</Label>
            <Input
              id="name"
              value={newServer.name}
              onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
              placeholder="Введите название сервера"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="host">Хост</Label>
            <Input
              id="host"
              value={newServer.host}
              onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
              placeholder="Например: example.com или 192.168.1.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ssh_username">SSH Пользователь</Label>
            <Input
              id="ssh_username"
              value={newServer.ssh_username}
              onChange={(e) => setNewServer({ ...newServer, ssh_username: e.target.value })}
              placeholder="root"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ssh_private_key">Приватный SSH ключ</Label>
            <Input
              id="ssh_private_key"
              type="file"
              onChange={(e) => handleFileUpload(e, "private")}
              accept=".pem,.key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ssh_public_key">Публичный SSH ключ</Label>
            <Input
              id="ssh_public_key"
              type="file"
              onChange={(e) => handleFileUpload(e, "public")}
              accept=".pub"
            />
          </div>
        </div>
        <Button onClick={handleAddServer} className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить сервер
        </Button>
      </CardContent>
    </Card>
  );
}