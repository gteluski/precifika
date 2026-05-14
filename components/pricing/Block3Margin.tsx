"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoTooltip } from "@/components/ui/InfoTooltip"
import { formatCurrency } from "@/lib/utils/formatters"
import { PricingState } from "@/lib/hooks/usePricingCalculator"

interface Block3Props {
  state: PricingState;
  updateState: (updates: Partial<PricingState>) => void;
  actualMargin: number;
  suggestedPrice: number;
}

export function Block3Margin({ state, updateState, actualMargin, suggestedPrice }: Block3Props) {
  return (
    <div className="bg-white rounded-2xl border-t-8 border-t-primary shadow-sm overflow-hidden flex flex-col h-full border-x border-b">
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-black text-secondary">3 — Margem e Resultado</h2>
          <p className="text-xs text-zinc-500 mt-1">Defina sua margem ou o preço de venda desejado</p>
        </div>

        <Tabs 
          value={state.marginInputMode} 
          onValueChange={(val) => updateState({ marginInputMode: val as 'percentage' | 'price' })}
          className="mb-8"
        >
          <TabsList className="grid grid-cols-2 w-full h-12 p-1 bg-slate-100">
            <TabsTrigger value="percentage" className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary">
              DEFINIR MARGEM (%)
            </TabsTrigger>
            <TabsTrigger value="price" className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-primary">
              DEFINIR PREÇO (R$)
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {state.marginInputMode === 'percentage' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="margin" className="text-xs font-bold uppercase text-zinc-500">
                  Margem de Lucro Desejada (%)
                  <InfoTooltip content="Quanto você quer que sobre de lucro real após pagar todos os custos e impostos." />
                </Label>
                <span className="text-2xl font-black text-primary">{state.desiredMargin}%</span>
              </div>
              <Slider 
                value={[state.desiredMargin]} 
                min={0} 
                max={80} 
                step={0.5}
                onValueChange={([val]) => updateState({ desiredMargin: val })}
                className="py-4"
              />
              <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
                <span>0% (Ponto de Equilíbrio)</span>
                <span>80% (Margem Alta)</span>
              </div>
            </div>

            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center">
              <span className="text-[10px] font-bold text-primary uppercase mb-2">Preço sugerido com esta margem</span>
              <span className="text-3xl font-black text-secondary">{formatCurrency(suggestedPrice)}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice" className="text-xs font-bold uppercase text-zinc-500">
                Quanto você quer cobrar? (R$)
                <InfoTooltip content="Digite o preço final que o seu cliente irá pagar." />
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">R$</span>
                <Input 
                  id="sellingPrice"
                  type="number" 
                  step="0.01"
                  placeholder="0,00"
                  value={state.sellingPrice || ""}
                  onChange={(e) => updateState({ sellingPrice: Number(e.target.value) })}
                  className="pl-12 h-16 text-2xl font-black text-secondary border-2 border-slate-200 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Margem real com este preço</span>
              <span className={cn(
                "text-3xl font-black",
                actualMargin < 0 ? "text-danger" : "text-primary"
              )}>
                {actualMargin.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t flex justify-center items-center">
        <p className="text-[10px] text-zinc-400 font-medium text-center italic">
          Os valores são calculados considerando impostos sobre a venda.
        </p>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
