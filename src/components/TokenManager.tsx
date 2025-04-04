
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const TokenManager = () => {
  const [newToken, setNewToken] = useState("");
  const { toast } = useToast();

  const addToken = () => {
    if (!newToken) {
      toast({
        title: "Ошибка",
        description: "Введите токен",
        variant: "destructive",
      });
      return;
    }

    const tokens = JSON.parse(localStorage.getItem("yandex_tokens") || "[]");
    if (!tokens.includes(newToken)) {
      tokens.push(newToken);
      localStorage.setItem("yandex_tokens", JSON.stringify(tokens));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('tokensUpdated'));
      
      toast({
        title: "Успешно",
        description: "Токен добавлен",
      });
      setNewToken("");
    } else {
      toast({
        title: "Ошибка",
        description: "Такой токен уже существует",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-4 mb-8">
      <Input
        value={newToken}
        onChange={(e) => setNewToken(e.target.value)}
        placeholder="Введите токен Яндекс.Директ"
        className="flex-1"
      />
      <Button onClick={addToken}>Добавить токен</Button>
    </div>
  );
};
