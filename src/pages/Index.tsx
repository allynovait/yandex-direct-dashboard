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

const Index = () => {
  const { isAuthenticated, login } = useYandexAuth();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ["yandex-stats", dateRange],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      
      const token = localStorage.getItem("yandex_token");
      if (!token) return [];

      const api = new YandexDirectAPI(token);
      return api.getStats(dateRange);
    },
    enabled: isAuthenticated,
  });

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

  if (!stats) return null;

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