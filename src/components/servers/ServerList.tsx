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
        <CardTitle>Server List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>SSH Username</TableHead>
              <TableHead>SSH Keys</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : servers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No servers added yet
                </TableCell>
              </TableRow>
            ) : (
              servers?.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>{server.name}</TableCell>
                  <TableCell>{server.host}</TableCell>
                  <TableCell>{server.ssh_username}</TableCell>
                  <TableCell>
                    {server.ssh_private_key ? "✅" : "❌"} Private
                    <br />
                    {server.ssh_public_key ? "✅" : "❌"} Public
                  </TableCell>
                  <TableCell>
                    {new Date(server.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={selectedServer === server.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSelectServer(server.id)}
                    >
                      <Terminal className="mr-2 h-4 w-4" />
                      Manage
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