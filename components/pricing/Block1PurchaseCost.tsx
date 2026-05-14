"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { InfoTooltip } from "@/components/ui/InfoTooltip"
import { formatCurrency } from "@/lib/utils/formatters"
import { TechnicalSheet } from "./TechnicalSheet"
import { PricingState } from "@/lib/hooks/usePricingCalculator"

interface Block1Props {
  state: PricingState;
  updateState: (updates: Partial<PricingState>) => void;
  purchaseTaxesAmount: number;
}

export function Block1PurchaseCost({ state, updateState, purchaseTaxesAmount }: Block1Props) {
  const [showTaxes, setShowTaxes] = useState(false);

  return (
    <div className="bg-white rounded-2xl border-t-8 border-t-secondary shadow-sm overflow-hidden flex flex-col h-full border-x border-b">
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-black text-secondary">1 — Custo de Compra</h2>
          <p className="text-xs text-zinc-500 mt-1">O que você pagou para adquirir ou produzir este item</p>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-6">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-secondary">Origem do custo</span>
            <span className="text-[10px] text-zinc-500">{state.useTechnicalSheet ? "Ficha técnica ativa" : "Valor manual"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium", !state.useTechnicalSheet ? "text-primary" : "text-zinc-400")}>Manual</span>
            <Switch 
              checked={state.useTechnicalSheet} 
              onCheckedChange={(val) => updateState({ useTechnicalSheet: val })} 
            />
            <span className={cn("text-xs font-medium", state.useTechnicalSheet ? "text-primary" : "text-zinc-400")}>Ficha</span>
          </div>
        </div>

        {!state.useTechnicalSheet ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label htmlFor="purchaseCost" className="text-xs font-bold uppercase text-zinc-500">
                Valor de compra (R$)
                <InfoTooltip content="Preço pago pelo produto na nota fiscal do fornecedor." />
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
                <Input 
                  id="purchaseCost"
                  type="number" 
                  step="0.01"
                  value={state.purchaseCost || ""}
                  onChange={(e) => updateState({ purchaseCost: Number(e.target.value) })}
                  className="pl-10 font-bold text-secondary"
                />
              </div>
            </div>
          </div>
        ) : (
          <TechnicalSheet 
            items={state.technicalSheet} 
            onChange={(items) => updateState({ technicalSheet: items })} 
          />
        )}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="packagingCost" className="text-xs font-bold uppercase text-zinc-500">
              Embalagem (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
              <Input 
                id="packagingCost"
                type="number" 
                step="0.01"
                value={state.packagingCost || ""}
                onChange={(e) => updateState({ packagingCost: Number(e.target.value) })}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="freightCost" className="text-xs font-bold uppercase text-zinc-500">
              Frete (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">R$</span>
              <Input 
                id="freightCost"
                type="number" 
                step="0.01"
                value={state.freightCost || ""}
                onChange={(e) => updateState({ freightCost: Number(e.target.value) })}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <button 
            onClick={() => setShowTaxes(!showTaxes)}
            className="flex items-center justify-between w-full text-zinc-500 hover:text-secondary transition-colors"
          >
            <span className="text-xs font-bold uppercase">Impostos pagos na compra</span>
            {showTaxes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTaxes && (
            <div className="grid grid-cols-2 gap-4 mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="icmsEntry" className="text-[10px] font-bold uppercase text-zinc-400">
                  ICMS entrada (%)
                  <InfoTooltip content="Crédito de ICMS ou imposto pago na entrada da mercadoria." />
                </Label>
                <Input 
                  id="icmsEntry"
                  type="number" 
                  step="0.1"
                  value={state.icmsEntryRate || ""}
                  onChange={(e) => updateState({ icmsEntryRate: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipi" className="text-[10px] font-bold uppercase text-zinc-400">
                  IPI (%)
                </Label>
                <Input 
                  id="ipi"
                  type="number" 
                  step="0.1"
                  value={state.ipiRate || ""}
                  onChange={(e) => updateState({ ipiRate: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difal" className="text-[10px] font-bold uppercase text-zinc-400">
                  DIFAL (%)
                </Label>
                <Input 
                  id="difal"
                  type="number" 
                  step="0.1"
                  value={state.difalRate || ""}
                  onChange={(e) => updateState({ difalRate: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherPurchaseTaxes" className="text-[10px] font-bold uppercase text-zinc-400">
                  Outros (%)
                </Label>
                <Input 
                  id="otherPurchaseTaxes"
                  type="number" 
                  step="0.1"
                  value={state.otherPurchaseTaxes || ""}
                  onChange={(e) => updateState({ otherPurchaseTaxes: Number(e.target.value) })}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
        <span className="text-xs font-bold text-zinc-500 uppercase">Total de impostos:</span>
        <span className="text-sm font-bold text-primary">{formatCurrency(purchaseTaxesAmount)}</span>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
