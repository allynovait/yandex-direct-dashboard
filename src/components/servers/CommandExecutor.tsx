import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Terminal } from "lucide-react";

interface CommandExecutorProps {
  command: string;
  onCommandChange: (command: string) => void;
  onExecuteCommand: () => void;
}

export function CommandExecutor({ command, onCommandChange, onExecuteCommand }: CommandExecutorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Выполнить команду</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Input
            value={command}
            onChange={(e) => onCommandChange(e.target.value)}
            placeholder="Введите команду для выполнения"
            className="flex-1"
          />
          <Button onClick={onExecuteCommand}>
            <Terminal className="mr-2 h-4 w-4" />
            Выполнить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}