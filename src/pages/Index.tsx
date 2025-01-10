import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { DateRange } from "@/types/yandex";
import { YandexStats } from "@/types/yandex";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useYandexAuth } from "@/components/YandexAuthProvider";
import { YandexDirectAPI } from "@/services/yandexApi";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { isAuthenticated, login } = useYandexAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["yandex-stats", dateRange],
    queryFn: async () => {
      console.log("Fetching stats...");
      if (!isAuthenticated) {
        console.log("Not authenticated");
        return [];
      }
      
      const token = localStorage.getItem("yandex_token");
      if (!token) {
        console.log("No token found");
        return [];
      }

      console.log("Token found, creating API instance");
      const api = new YandexDirectAPI(token);
      try {
        const result = await api.getStats(dateRange);
        console.log("Stats received:", result);
        return result;
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить статистику. Попробуйте позже.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  console.log("Render state:", { isAuthenticated, isLoading, error, stats });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Войдите в Яндекс</h1>
        <Button onClick={login} className="bg-[#ff0000] hover:bg-[#cc0000]">
          Войти через Яндекс
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ff0000]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Произошла ошибка</h1>
        <p className="text-gray-600">Не удалось загрузить данные. Попробуйте позже.</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-[#ff0000] hover:bg-[#cc0000]"
        >
          Обновить страницу
        </Button>
      </div>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Нет данных</h1>
        <p className="text-gray-600">Статистика пока недоступна</p>
      </div>
    );
  }

  const formatNumber = (num: number) => new Intl.NumberFormat("ru-RU").format(num);
  const formatCurrency = (num: number) => 
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(num);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#ff0000]">
          Статистика Яндекс.Директ
        </h1>
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>
      
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Аккаунт</TableHead>
              <TableHead>Конверсии</TableHead>
              <TableHead>Расход</TableHead>
              <TableHead>Клики</TableHead>
              <TableHead>Показы</TableHead>
              <TableHead>Баланс</TableHead>
              <TableHead>CTR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((account: YandexStats) => (
              <TableRow key={account.accountId}>
                <TableCell className="font-medium">{account.accountName}</TableCell>
                <TableCell>{formatNumber(account.conversions)}</TableCell>
                <TableCell>{formatCurrency(account.spend)}</TableCell>
                <TableCell>{formatNumber(account.clicks)}</TableCell>
                <TableCell>{formatNumber(account.impressions)}</TableCell>
                <TableCell>{formatCurrency(account.balance)}</TableCell>
                <TableCell>{account.ctr}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Index;