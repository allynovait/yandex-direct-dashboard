
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { YandexDirectAPI } from "@/services/yandexApi";
import { DateRange, YandexStats } from "@/types/yandex";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const AnalyticsPage = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  useEffect(() => {
    if (!tokenId) return;
    
    // Find the token in localStorage that matches the tokenId (last 8 chars)
    const allTokens = JSON.parse(localStorage.getItem("yandex_tokens") || "[]");
    const matchingToken = allTokens.find((t: string) => t.slice(-8) === tokenId);
    
    if (matchingToken) {
      setToken(matchingToken);
    } else {
      toast({
        title: "Ошибка",
        description: "Токен не найден",
        variant: "destructive",
      });
    }
  }, [tokenId, toast]);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["token-analytics", token, dateRange],
    queryFn: async () => {
      if (!token) return null;
      const api = new YandexDirectAPI(token);
      return await api.getStats(dateRange);
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ff0000]"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto p-6">
        <Link to="/">
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад
          </Button>
        </Link>
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Произошла ошибка</h1>
          <p className="text-gray-600">Не удалось загрузить данные. Попробуйте позже.</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => new Intl.NumberFormat("ru-RU").format(num);
  const formatCurrency = (num: number) => 
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(num);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  // Prepare data for charts
  const genderData = stats.demographics?.gender ? [
    { name: "Мужчины", value: stats.demographics.gender.male },
    { name: "Женщины", value: stats.demographics.gender.female },
    { name: "Неизвестно", value: stats.demographics.gender.unknown },
  ] : [];

  const ageData = stats.demographics?.age ? [
    { name: "До 18", value: stats.demographics.age.under18 },
    { name: "18-24", value: stats.demographics.age.age18to24 },
    { name: "25-34", value: stats.demographics.age.age25to34 },
    { name: "35-44", value: stats.demographics.age.age35to44 },
    { name: "45-54", value: stats.demographics.age.age45to54 },
    { name: "55+", value: stats.demographics.age.age55plus },
    { name: "Неизвестно", value: stats.demographics.age.unknown },
  ] : [];

  const deviceTypeData = stats.devices?.deviceType ? [
    { name: "Компьютер", value: stats.devices.deviceType.desktop },
    { name: "Мобильный", value: stats.devices.deviceType.mobile },
    { name: "Планшет", value: stats.devices.deviceType.tablet },
    { name: "Другое", value: stats.devices.deviceType.other },
  ] : [];

  const osData = stats.devices?.os ? 
    Object.entries(stats.devices.os).map(([name, value]) => ({ name, value })) : [];

  const browserData = stats.devices?.browser ? 
    Object.entries(stats.devices.browser).map(([name, value]) => ({ name, value })) : [];

  const conversionGoalsData = stats.conversionGoals || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-[#ff0000]">
            Аналитика аккаунта {stats.accountName}
          </h1>
        </div>
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Клики</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.clicks)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Показы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.impressions)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ctr}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Расход</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.spend)}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="demographics" className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demographics">Демография</TabsTrigger>
          <TabsTrigger value="devices">Устройства</TabsTrigger>
          <TabsTrigger value="browsers">Браузеры и ОС</TabsTrigger>
          <TabsTrigger value="conversions">Конверсии</TabsTrigger>
        </TabsList>
        
        <TabsContent value="demographics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Пол</CardTitle>
                <CardDescription>Распределение аудитории по полу</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ChartContainer className="h-80" config={{
                  male: { label: "Мужчины", color: "#0088FE" },
                  female: { label: "Женщины", color: "#FF8042" },
                  unknown: { label: "Неизвестно", color: "#FFBB28" }
                }}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Возраст</CardTitle>
                <CardDescription>Распределение аудитории по возрастным группам</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ChartContainer className="h-80" config={{
                  age: { label: "Возраст", color: "#0088FE" }
                }}>
                  <BarChart data={ageData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name="Количество" fill="#0088FE" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="devices" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Типы устройств</CardTitle>
              <CardDescription>Распределение аудитории по типам устройств</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <ChartContainer className="h-80" config={{
                desktop: { label: "Компьютер", color: "#0088FE" },
                mobile: { label: "Мобильный", color: "#00C49F" },
                tablet: { label: "Планшет", color: "#FFBB28" },
                other: { label: "Другое", color: "#FF8042" }
              }}>
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="browsers" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Операционные системы</CardTitle>
                <CardDescription>Распределение аудитории по операционным системам</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ChartContainer className="h-80" config={{
                  os: { label: "ОС", color: "#0088FE" }
                }}>
                  <BarChart data={osData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name="Количество" fill="#0088FE" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Браузеры</CardTitle>
                <CardDescription>Распределение аудитории по браузерам</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <ChartContainer className="h-80" config={{
                  browser: { label: "Браузер", color: "#00C49F" }
                }}>
                  <BarChart data={browserData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name="Количество" fill="#00C49F" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="conversions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Конверсии</CardTitle>
              <CardDescription>Статистика по целям конверсии</CardDescription>
            </CardHeader>
            <CardContent>
              {conversionGoalsData.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {conversionGoalsData.map((goal) => (
                      <Card key={goal.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{goal.name}</CardTitle>
                          <CardDescription>ID: {goal.id}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatNumber(goal.conversions)}</div>
                          <p className="text-sm text-muted-foreground">Конверсия: {goal.conversionRate.toFixed(2)}%</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Нет отслеживаемых целей конверсии</p>
                  <p className="text-sm">Добавьте цели конверсии в настройках токена</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
