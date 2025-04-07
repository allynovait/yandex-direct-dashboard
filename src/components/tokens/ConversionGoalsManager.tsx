
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface ConversionGoalsManagerProps {
  token: string;
}

export const ConversionGoalsManager = ({ token }: ConversionGoalsManagerProps) => {
  const [newGoalId, setNewGoalId] = useState("");
  const { toast } = useToast();
  const storageKey = `conversion_goals_${token}`;
  const [goals, setGoals] = useState<string[]>(() => {
    const savedGoals = localStorage.getItem(storageKey);
    return savedGoals ? JSON.parse(savedGoals) : [];
  });

  const addGoal = () => {
    if (!newGoalId.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ID цели конверсии",
        variant: "destructive",
      });
      return;
    }

    if (goals.includes(newGoalId.trim())) {
      toast({
        title: "Ошибка",
        description: "Такая цель уже существует",
        variant: "destructive",
      });
      return;
    }

    const updatedGoals = [...goals, newGoalId.trim()];
    setGoals(updatedGoals);
    localStorage.setItem(storageKey, JSON.stringify(updatedGoals));
    setNewGoalId("");
    
    toast({
      title: "Цель добавлена",
      description: `Цель ${newGoalId.trim()} добавлена для отслеживания`,
    });
  };

  const removeGoal = (goalId: string) => {
    const updatedGoals = goals.filter(id => id !== goalId);
    setGoals(updatedGoals);
    localStorage.setItem(storageKey, JSON.stringify(updatedGoals));
    
    toast({
      title: "Цель удалена",
      description: `Цель ${goalId} удалена из отслеживания`,
    });
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-medium">Цели конверсии</h3>
      <div className="flex gap-2">
        <Input
          value={newGoalId}
          onChange={(e) => setNewGoalId(e.target.value)}
          placeholder="Введите ID цели конверсии"
          className="flex-1"
        />
        <Button onClick={addGoal}>Добавить</Button>
      </div>
      
      {goals.length > 0 ? (
        <div className="space-y-2 mt-2">
          <h4 className="text-sm font-medium text-muted-foreground">Отслеживаемые цели:</h4>
          <div className="grid gap-2">
            {goals.map((goalId) => (
              <div key={goalId} className="flex items-center justify-between p-2 rounded-md bg-muted">
                <span className="font-mono">{goalId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGoal(goalId)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Нет отслеживаемых целей конверсии</p>
      )}
    </div>
  );
};
