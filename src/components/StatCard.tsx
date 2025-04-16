
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isCurrency?: boolean;
}

export const StatCard = ({ title, value, icon, isCurrency = false }: StatCardProps) => {
  const formattedValue = isCurrency 
    ? new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(Number(value))
    : value;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
      </CardContent>
    </Card>
  );
};
