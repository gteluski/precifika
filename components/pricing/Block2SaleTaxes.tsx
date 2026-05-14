"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { InfoTooltip } from "@/components/ui/InfoTooltip"
import { PricingState } from "@/lib/hooks/usePricingCalculator"

interface Block2Props {
  state: PricingState;
  updateState: (updates: Partial<PricingState>) => void;
  totalSaleTaxRate: number;
  initialSimplesRate: number;
}

export function Block2SaleTaxes({ state, updateState, totalSaleTaxRate, initialSimplesRate }: Block2Props) {
  const isSimplesEdited = state.simplesRate !== initialSimplesRate;

  return (
    <div className="bg-white rounded-2xl border-t-8 border-t-amber-500 shadow-sm overflow-hidden flex flex-col h-full border-x border-b">
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-black text-secondary">2 — Despesas e Impostos</h2>
          <p className="text-xs text-zinc-500 mt-1">O que você paga para operar e vender este item</p>
        </div>

        <div className="p-3 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-primary uppercase">Perfil Fiscal Carregado</span>
            <span className="text-xs font-bold text-secondary">Simples Nacional · Alíquota {initialSimplesRate.toFixed(2)}%</span>
          </div>
          <Link href="/dashboard/onboarding" className="text-[10px] font-bold text-primary hover:underline">
            Alterar →
          </Link>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fixedExpenses" className="text-xs font-bold uppercase text-zinc-500">
                Despesas fixas rateadas (R$)
                <InfoTooltip content="Rateie seu aluguel, energia e outros fixos por produto para garantir que eles sejam cobertos." />
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
                <Input 
                  id="fixedExpenses"
                  type="number" 
                  step="0.01"
                  placeholder="0,00"
                  value={state.fixedExpensesShare || ""}
                  onChange={(e) => updateState({ fixedExpensesShare: Number(e.target.value) })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variableExpenses" className="text-xs font-bold uppercase text-zinc-500">
                Despesas variáveis (%)
                <InfoTooltip content="Comissões de vendedores, brindes, embalagens extras e outros custos que só ocorrem na venda." />
              </Label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">%</span>
                <Input 
                  id="variableExpenses"
                  type="number" 
                  step="0.1"
                  placeholder="0,00"
                  value={state.variableExpensesRate || ""}
                  onChange={(e) => updateState({ variableExpensesRate: Number(e.target.value) })}
                  className="pr-10"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t space-y-4">
            <h3 className="text-xs font-bold uppercase text-zinc-400">Impostos e Taxas de Venda</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="simples" className="text-[10px] font-bold uppercase text-zinc-500 flex items-center justify-between">
                  Simples / MEI (%)
                  {isSimplesEdited && <AlertCircle className="w-3 h-3 text-amber-500" />}
                </Label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">%</span>
                  <Input 
                    id="simples"
                    type="number" 
                    step="0.01"
                    value={state.simplesRate || ""}
                    onChange={(e) => updateState({ simplesRate: Number(e.target.value) })}
                    className={cn(
                      "pr-8 h-9 text-sm font-bold",
                      isSimplesEdited ? "border-amber-300 focus-visible:ring-amber-500" : "bg-slate-50 border-transparent text-primary"
                    )}
                  />
                </div>
                {!isSimplesEdited && <span className="text-[9px] text-primary font-bold">✦ Do seu perfil</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardFee" className="text-[10px] font-bold uppercase text-zinc-500">Taxa de cartão (%)</Label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">%</span>
                  <Input 
                    id="cardFee"
                    type="number" 
                    step="0.01"
                    value={state.cardFeeRate || ""}
                    onChange={(e) => updateState({ cardFeeRate: Number(e.target.value) })}
                    className="pr-8 h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketplace" className="text-[10px] font-bold uppercase text-zinc-500">Marketplace (%)</Label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">%</span>
                  <Input 
                    id="marketplace"
                    type="number" 
                    step="0.01"
                    value={state.marketplaceFeeRate || ""}
                    onChange={(e) => updateState({ marketplaceFeeRate: Number(e.target.value) })}
                    className="pr-8 h-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherSaleTaxes" className="text-[10px] font-bold uppercase text-zinc-500">Outros (%)</Label>
                <div className="relative">
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px]">%</span>
                  <Input 
                    id="otherSaleTaxes"
                    type="number" 
                    step="0.01"
                    value={state.otherSaleTaxes || ""}
                    onChange={(e) => updateState({ otherSaleTaxes: Number(e.target.value) })}
                    className="pr-8 h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border-t flex justify-between items-center">
        <span className="text-xs font-bold text-amber-700 uppercase">Custo total de venda:</span>
        <span className="text-sm font-bold text-amber-700">{totalSaleTaxRate.toFixed(2)}%</span>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
