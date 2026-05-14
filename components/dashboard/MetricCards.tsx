import { 
  ShoppingBag, 
  Wrench, 
  TrendingUp, 
  AlertTriangle 
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardsProps {
  productsCount: number;
  servicesCount: number;
  averageMargin: number;
  negativeMarginsCount: number;
  plan: 'free' | 'premium';
}

export function MetricCards({ 
  productsCount, 
  servicesCount, 
  averageMargin, 
  negativeMarginsCount,
  plan
}: MetricCardsProps) {
  const metrics = [
    {
      title: "Total de Produtos",
      value: productsCount,
      subtext: productsCount > 0 ? "▲ Cadastro ativo" : "Nenhum produto",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Total de Serviços",
      value: servicesCount,
      subtext: plan === 'free' ? "Limite: 1 serviço" : "Ilimitado no Premium",
      icon: Wrench,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Margem Média",
      value: `${averageMargin.toFixed(1)}%`,
      subtext: "Baseado nos últimos cálculos",
      icon: TrendingUp,
      color: "text-primary",
      bg: "bg-green-50"
    },
    {
      title: "Alertas de Margem",
      value: negativeMarginsCount,
      subtext: negativeMarginsCount > 0 ? "Margem negativa detectada" : "Tudo saudável ✓",
      icon: AlertTriangle,
      color: negativeMarginsCount > 0 ? "text-danger" : "text-zinc-400",
      bg: negativeMarginsCount > 0 ? "bg-red-50" : "bg-zinc-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, i) => (
        <Card key={i} className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", metric.bg)}>
                <metric.icon className={cn("w-6 h-6", metric.color)} />
              </div>
              <span className={cn("text-2xl font-bold", metric.color)}>
                {metric.value}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">{metric.title}</p>
              <p className={cn("text-xs mt-1", metric.subtext.includes("saudável") ? "text-zinc-400" : metric.color)}>
                {metric.subtext}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
