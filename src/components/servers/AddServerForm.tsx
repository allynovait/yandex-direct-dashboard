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
    name: "Тестовый сервер",
    host: "89.223.70.180",
    ssh_username: "root",
    ssh_private_key: `-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----`,
    ssh_public_key: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC6vCa6VF7guOxDdjMeGJlAku6Ck+hSFXKlzhcxUdSod88fQP5TnD9ou2cV+3WaBhIjxsSVGszddt9POPT97iAnnlcvPv6vTmn0DZO5bpD3ZNa6DDXl5xUOG3aUCL0Ltp+JM4066ybZyanhAEnZVu3Cg5B9tSeNY8GXk+EzTVrzM8AxmtIs/xc2w9huTJ+oXZR6mZDiPjUUb9luFYTDKQU0Uj9GNg72BLhtFj7zzcOZ2HnOK3ZHsw7pwpL55e8vLWnDmOBX51Ql7aWQGplgpHk/Bb/2Hqxio3FxJACWqbxpxImkYbGtveE3AsVDA3gjNHqIKMjmM5sjzaU+nMY7o0ew12iCbYNS/gRbfB9JrWds6EVaHC99EThvyXf2bVO/eHHag6QyVYEnbewV6H4vGZeWf0IZ8O+QD/3OEGfPzRyNN1/JtHFJwE0rrOkfwLeyNnsxM41uLqqMKfnMJTurpA88NojQfRf6dM2Ds3UGuAXXbpEsUbndOGHYw0CvyoOLFds4iI9ln0aLz2JIhOzHpxLqXwx2ow5KqREjThuhxAi+Ggb41Q1XiNGKjU5Qyo616c56cRHpOmkuOLHXrsKcutncooN5gcA4klUlyilY8+DRjAgbaL8GZRHrt1IcypvX4mnfLSspqQ7YOZzKH5Of44FM8umYmlZekoSCIKMugMhUww== incredo@bk.ru",
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