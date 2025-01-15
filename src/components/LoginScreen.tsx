import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LoginScreenProps {
  onSuccess: () => void;
}

export const LoginScreen = ({ onSuccess }: LoginScreenProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Ошибка авторизации",
          description: error.message,
        });
        return;
      }

      if (data.session) {
        localStorage.setItem("isAuthenticated", "true");
        onSuccess();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка авторизации",
        description: "Произошла ошибка при попытке входа",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-sm space-y-6 rounded-lg border bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-[#ff0000]">Вход в систему</h1>
          <p className="text-muted-foreground">
            Введите ваши учетные данные для входа
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Email</Label>
            <Input
              id="username"
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#ff0000] hover:bg-[#cc0000]"
          >
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
};