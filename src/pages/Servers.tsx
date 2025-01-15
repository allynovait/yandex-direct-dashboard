import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

interface Server {
  id: string;
  name: string;
  host: string;
  created_at: string;
  ssh_username: string;
  ssh_private_key: string | null;
  ssh_public_key: string | null;
}

export default function Servers() {
  const { toast } = useToast();
  const [newServer, setNewServer] = useState({
    name: "",
    host: "",
    ssh_username: "root",
    ssh_private_key: "",
    ssh_public_key: "",
  });

  const { data: servers, isLoading, refetch } = useQuery({
    queryKey: ["servers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("servers").select("*");
      if (error) throw error;
      return data as Server[];
    },
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
    refetch();
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
    <div className="container mx-auto py-6 space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Список серверов</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Хост</TableHead>
                <TableHead>SSH Пользователь</TableHead>
                <TableHead>SSH Ключи</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : servers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Нет добавленных серверов
                  </TableCell>
                </TableRow>
              ) : (
                servers?.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell>{server.name}</TableCell>
                    <TableCell>{server.host}</TableCell>
                    <TableCell>{server.ssh_username}</TableCell>
                    <TableCell>
                      {server.ssh_private_key ? "✅" : "❌"} Приватный
                      <br />
                      {server.ssh_public_key ? "✅" : "❌"} Публичный
                    </TableCell>
                    <TableCell>
                      {new Date(server.created_at).toLocaleDateString("ru-RU")}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Управление
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}