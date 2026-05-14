"use client"

import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils/formatters"

interface NegativeMarginAlertProps {
  isNegative: boolean;
  profitPerUnit: number;
  minimumPrice: number;
  sellingPrice: number;
  onUseMinimumPrice: () => void;
}

export function NegativeMarginAlert({ 
  isNegative, 
  profitPerUnit, 
  minimumPrice, 
  sellingPrice,
  onUseMinimumPrice 
}: NegativeMarginAlertProps) {
  if (sellingPrice <= 0) return null;

  if (isNegative) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 animate-pulse-subtle shadow-sm mb-8">
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4 shrink-0">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-red-700">⚠ Você está vendendo no prejuízo!</h3>
            <p className="text-sm text-red-600 mt-1">
              Com o preço de <span className="font-bold">{formatCurrency(sellingPrice)}</span>, você perde <span className="font-bold">{formatCurrency(Math.abs(profitPerUnit))}</span> por unidade vendida.
            </p>
            <p className="text-xs text-red-500 mt-2">
              O preço mínimo para não ter prejuízo é <span className="font-bold">{formatCurrency(minimumPrice)}</span>.
            </p>
          </div>
          <Button 
            onClick={onUseMinimumPrice}
            className="bg-danger hover:bg-red-700 text-white font-bold h-12 ml-4"
          >
            Usar preço mínimo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-sm mb-8 animate-in fade-in duration-500">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 shrink-0">
          <CheckCircle2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-black text-green-700">✓ Precificação saudável</h3>
          <p className="text-sm text-green-600 mt-1">
            Lucro de <span className="font-bold">{formatCurrency(profitPerUnit)}</span> por unidade vendida.
          </p>
        </div>
      </div>
    </div>
  )
}
