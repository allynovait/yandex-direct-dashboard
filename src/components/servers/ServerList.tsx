import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Terminal } from "lucide-react";

interface Server {
  id: string;
  name: string;
  host: string;
  created_at: string;
  ssh_username: string;
  ssh_private_key: string | null;
  ssh_public_key: string | null;
}

interface ServerListProps {
  servers: Server[] | null;
  isLoading: boolean;
  selectedServer: string | null;
  onSelectServer: (serverId: string) => void;
}

export function ServerList({ servers, isLoading, selectedServer, onSelectServer }: ServerListProps) {
  return (
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
                    <Button
                      variant={selectedServer === server.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSelectServer(server.id)}
                    >
                      <Terminal className="mr-2 h-4 w-4" />
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
  );
}