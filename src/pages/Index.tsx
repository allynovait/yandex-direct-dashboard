import { useQuery } from "@tanstack/react-query";
import { BarChart3, Coins, MousePointerClick, Target, Wallet2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { YandexStats } from "@/types/yandex";

const mockStats: YandexStats = {
  conversions: 150,
  spend: 50000,
  clicks: 1000,
  impressions: 10000,
  balance: 25000,
  ctr: 10,
};

const Index = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["yandex-stats"],
    queryFn: async () => {
      // В будущем здесь будет реальный API-запрос
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
      <h1 className="text-3xl font-bold mb-8 text-yandex-blue">
        Статистика Яндекс.Директ
      </h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Конверсии"
          value={formatNumber(stats.conversions)}
          icon={<Target className="h-4 w-4 text-yandex-red" />}
        />
        <StatCard
          title="Расход"
          value={formatCurrency(stats.spend)}
          icon={<Coins className="h-4 w-4 text-yellow-600" />}
        />
        <StatCard
          title="Клики"
          value={formatNumber(stats.clicks)}
          icon={<MousePointerClick className="h-4 w-4 text-green-600" />}
        />
        <StatCard
          title="Показы"
          value={formatNumber(stats.impressions)}
          icon={<BarChart3 className="h-4 w-4 text-blue-600" />}
        />
        <StatCard
          title="Баланс"
          value={formatCurrency(stats.balance)}
          icon={<Wallet2 className="h-4 w-4 text-purple-600" />}
        />
        <StatCard
          title="CTR"
          value={`${stats.ctr}%`}
          icon={<Target className="h-4 w-4 text-orange-600" />}
        />
      </div>
    </div>
  );
};

export default Index;