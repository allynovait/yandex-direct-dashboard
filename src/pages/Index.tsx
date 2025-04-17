
import { useQuery } from "@tanstack/react-query";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { TokenManager } from "@/components/TokenManager";
import { TokenList } from "@/components/TokenList";
import { ReloadIcon } from "@radix-ui/react-icons";
import { getAllAccountsStats } from "@/services/yandexApi";
import { LoginScreen } from "@/components/LoginScreen";

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["yandex-stats", dateRange],
    queryFn: async () => {
      console.log("Fetching stats...");
      try {
        const results = await getAllAccountsStats(dateRange);
        console.log("Stats received:", results);
        return results;
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
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!isAuthenticated) {
    return <LoginScreen onSuccess={() => setIsAuthenticated(true)} />;
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

  const formatNumber = (num: number) => new Intl.NumberFormat("ru-RU").format(num);
  
  // Update formatCurrency to handle both string and number types
  const formatCurrency = (value: number | string) => {
    // If value is a string (like "Ошибка"), return it as is
    if (typeof value === 'string') {
      return value;
    }
    // If value is a number, format it as currency
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(value);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#ff0000]">
          Статистика Яндекс.Директ
        </h1>
        <div className="flex items-center gap-4">
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button 
            onClick={() => refetch()} 
            variant="outline"
            className="gap-2"
          >
            <ReloadIcon className="h-4 w-4" />
            Обновить данные
          </Button>
        </div>
      </div>

      <TokenManager />
      <TokenList />
      
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
            {stats && stats.length > 0 ? (
              stats.map((account: YandexStats) => (
                <TableRow key={account.accountId}>
                  <TableCell className="font-medium">{account.accountName}</TableCell>
                  <TableCell>{formatNumber(account.conversions)}</TableCell>
                  <TableCell>{formatCurrency(account.spend)}</TableCell>
                  <TableCell>{formatNumber(account.clicks)}</TableCell>
                  <TableCell>{formatNumber(account.impressions)}</TableCell>
                  <TableCell>{formatCurrency(account.balance)}</TableCell>
                  <TableCell>{account.ctr}%</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Добавьте токены аккаунтов Яндекс.Директ для отображения статистики
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Index;
