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
import { useState } from "react";

const mockStats: YandexStats[] = [
  {
    accountId: "1",
    accountName: "Основной аккаунт",
    conversions: 150,
    spend: 50000,
    clicks: 1000,
    impressions: 10000,
    balance: 25000,
    ctr: 10,
  },
  {
    accountId: "2",
    accountName: "Тестовый аккаунт",
    conversions: 75,
    spend: 25000,
    clicks: 500,
    impressions: 5000,
    balance: 12500,
    ctr: 8,
  },
];

const Index = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ["yandex-stats", dateRange],
    queryFn: async () => {
      // В будущем здесь будет реальный API-запрос с учетом dateRange
      return mockStats;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yandex-blue"></div>
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
        <h1 className="text-3xl font-bold text-yandex-blue">
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
            {stats.map((account) => (
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