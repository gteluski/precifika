"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { COMMON_CNAES } from "@/lib/constants/cnae"
import { calculateEffectiveRate } from "@/lib/utils/tax-calculator"
import { InfoTooltip } from "@/components/ui/InfoTooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import { OnboardingFormData } from "../OnboardingWizard"

interface Step3Props {
  formData: OnboardingFormData;
  updateData: (data: Partial<OnboardingFormData>) => void;
}

export function Step3Cnae({ formData, updateData }: Step3Props) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState(COMMON_CNAES.slice(0, 5))

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        const filtered = COMMON_CNAES.filter(c => 
          c.code.includes(searchTerm) || 
          c.description.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
        setResults(filtered);
      } else {
        setResults(COMMON_CNAES.slice(0, 5));
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const handleSelectCnae = (cnae: {code: string, description: string}) => {
    updateData({
      cnae: cnae.code,
      cnae_description: cnae.description
    });
    setSearchTerm("");
  }

  const handleClearCnae = () => {
    updateData({
      cnae: "",
      cnae_description: ""
    });
  }

  const effectiveRate = calculateEffectiveRate(
    formData.simples_annex,
    formData.monthly_revenue || 0,
    formData.tax_regime
  );

  useEffect(() => {
    if (effectiveRate !== formData.effective_rate) {
      updateData({ effective_rate: effectiveRate });
    }
  }, [effectiveRate, formData.effective_rate, updateData]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10 pb-10">
      <div>
        <h2 className="text-3xl font-bold text-secondary mb-2">Qual é a atividade principal da sua empresa?</h2>
        <p className="text-zinc-500">O CNAE determina o enquadramento fiscal correto do seu negócio.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold text-secondary">
            CNAE Principal
            <InfoTooltip content="Código que classifica a atividade econômica da sua empresa. Consta no seu cartão CNPJ." />
          </Label>
          
          {formData.cnae ? (
            <div className="mt-2 p-4 border border-primary bg-green-50 rounded-lg flex items-start justify-between">
              <div>
                <span className="font-bold text-primary block">{formData.cnae}</span>
                <span className="text-sm text-zinc-700">{formData.cnae_description}</span>
              </div>
              <button 
                onClick={handleClearCnae}
                className="text-zinc-400 hover:text-danger transition-colors p-1"
                title="Remover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="mt-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <Input 
                placeholder="Pesquise pelo código ou nome da sua atividade..."
                className="pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {results.length > 0 ? (
                  results.map(cnae => (
                    <div 
                      key={cnae.code}
                      onClick={() => handleSelectCnae(cnae)}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-border last:border-0 flex justify-between items-center"
                    >
                      <div className="pr-4">
                        <span className="font-bold text-secondary block">{cnae.code}</span>
                        <span className="text-sm text-zinc-600 line-clamp-1">{cnae.description}</span>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap shrink-0">Anexo {cnae.annex}</Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-zinc-500">Nenhum CNAE encontrado.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {formData.tax_regime === 'simples_nacional' && (
          <div className="pt-6 animate-in fade-in duration-300">
            <Label htmlFor="revenue" className="text-base font-semibold text-secondary">
              Faturamento mensal estimado (R$)
            </Label>
            <p className="text-sm text-zinc-500 mb-2">
              Utilizado para calcular sua faixa de alíquota no Simples Nacional.
            </p>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
              <Input 
                id="revenue"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                className="pl-10 h-12 text-lg font-medium"
                value={formData.monthly_revenue || ''}
                onChange={(e) => updateData({ monthly_revenue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}

        {formData.tax_regime === 'simples_nacional' && formData.cnae && formData.monthly_revenue > 0 && (
          <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold text-secondary">✦ Alíquota efetiva calculada automaticamente</h3>
              <InfoTooltip content="Percentual de imposto que você paga sobre o faturamento, já considerando as deduções da tabela do Simples." />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="block text-xs text-zinc-500 uppercase font-semibold">Regime</span>
                <span className="font-medium text-secondary">Simples Nacional</span>
              </div>
              <div>
                <span className="block text-xs text-zinc-500 uppercase font-semibold">Anexo</span>
                <span className="font-medium text-secondary">{formData.simples_annex || '-'}</span>
              </div>
              <div>
                <span className="block text-xs text-zinc-500 uppercase font-semibold">Faturamento Anual</span>
                <span className="font-medium text-secondary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((formData.monthly_revenue || 0) * 12)}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border shadow-sm flex flex-col items-center justify-center -mt-2">
                <span className="block text-xs text-zinc-500 uppercase font-semibold mb-1">Alíquota Efetiva</span>
                <span className="text-2xl font-black text-primary">{effectiveRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
