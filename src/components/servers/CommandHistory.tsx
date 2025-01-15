import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Command {
  id: string;
  server_id: string;
  command: string;
  status: string;
  output: string | null;
  executed_at: string | null;
  created_at: string;
}

interface CommandHistoryProps {
  commands: Command[] | null;
  isLoading: boolean;
}

export function CommandHistory({ commands, isLoading }: CommandHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>История команд</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Команда</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Результат</TableHead>
              <TableHead>Время выполнения</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : commands?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Нет выполненных команд
                </TableCell>
              </TableRow>
            ) : (
              commands?.map((cmd) => (
                <TableRow key={cmd.id}>
                  <TableCell className="font-mono">{cmd.command}</TableCell>
                  <TableCell>{cmd.status}</TableCell>
                  <TableCell className="font-mono whitespace-pre-wrap">
                    {cmd.output}
                  </TableCell>
                  <TableCell>
                    {cmd.executed_at
                      ? new Date(cmd.executed_at).toLocaleString("ru-RU")
                      : "-"}
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