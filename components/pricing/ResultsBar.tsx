"use client"

import { formatCurrency } from "@/lib/utils/formatters"
import { cn } from "@/lib/utils"

interface ResultsBarProps {
  realCost: number;
  minimumPrice: number;
  suggestedPrice: number;
  profitPerUnit: number;
}

export function ResultsBar({ 
  realCost, 
  minimumPrice, 
  suggestedPrice, 
  profitPerUnit 
}: ResultsBarProps) {
  const metrics = [
    {
      label: "Custo real total",
      value: formatCurrency(realCost),
      color: "text-secondary"
    },
    {
      label: "Preço mínimo",
      value: formatCurrency(minimumPrice),
      color: "text-danger"
    },
    {
      label: "Preço sugerido",
      value: formatCurrency(suggestedPrice),
      color: "text-primary",
      isLarge: true
    },
    {
      label: "Lucro por unidade",
      value: formatCurrency(profitPerUnit),
      color: profitPerUnit >= 0 ? "text-primary" : "text-danger"
    }
  ];

  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl shadow-lg p-2 mb-8 overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {metrics.map((metric, i) => (
          <div key={i} className="p-4 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-wider">
              {metric.label}
            </span>
            <span className={cn(
              "font-black tracking-tight",
              metric.isLarge ? "text-3xl" : "text-xl",
              metric.color
            )}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
