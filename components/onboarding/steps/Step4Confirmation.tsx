"use client"

import { CheckCircle2, ArrowRight, Loader2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

import { OnboardingFormData } from "../OnboardingWizard"

interface Step4Props {
  formData: OnboardingFormData;
  setStep: (step: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function Step4Confirmation({ formData, setStep, onSubmit, isLoading }: Step4Props) {
  
  const getRegimeName = (id: string | null) => {
    if (!id) return "-";
    if (id === 'mei') return "MEI (Microempreendedor Individual)";
    if (id === 'simples_nacional') return "Simples Nacional";
    if (id === 'lucro_presumido') return "Lucro Presumido";
    return id;
  }

  const getBusinessName = (id: string | null) => {
    if (!id) return "-";
    if (id === 'product') return "Produto";
    if (id === 'service') return "Serviço";
    if (id === 'both') return "Produto e Serviço";
    return id;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 pb-10">
      <div className="text-center mb-10">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-secondary mb-2">Tudo certo! Confirme seu perfil fiscal.</h2>
        <p className="text-zinc-500">Você pode alterar essas informações a qualquer momento em Configurações.</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
          <h3 className="font-bold text-secondary">Resumo das Configurações</h3>
        </div>
        
        <div className="divide-y">
          <div className="p-4 flex justify-between items-center group">
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase block mb-1">Tipo de negócio</span>
              <span className="font-medium text-secondary">{getBusinessName(formData.business_type)}</span>
            </div>
            <button onClick={() => setStep(1)} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 flex justify-between items-center group">
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase block mb-1">Regime Tributário</span>
              <span className="font-medium text-secondary">{getRegimeName(formData.tax_regime)}</span>
              {formData.tax_regime === 'simples_nacional' && formData.simples_annex && (
                <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded-full">Anexo {formData.simples_annex}</span>
              )}
              {formData.fator_r && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Fator R Aplicado</span>
              )}
            </div>
            <button onClick={() => setStep(2)} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 flex justify-between items-center group">
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase block mb-1">Atividade (CNAE)</span>
              {formData.cnae ? (
                <>
                  <span className="font-medium text-secondary mr-2">{formData.cnae}</span>
                  <span className="text-sm text-zinc-600 line-clamp-1">{formData.cnae_description}</span>
                </>
              ) : (
                <span className="text-zinc-400 italic">Não informado</span>
              )}
            </div>
            <button onClick={() => setStep(3)} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {formData.tax_regime === 'simples_nacional' && (
            <div className="p-4 flex justify-between items-center group bg-primary/5">
              <div className="flex w-full items-center">
                <div className="flex-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase block mb-1">Faturamento Estimado</span>
                  <span className="font-medium text-secondary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.monthly_revenue || 0)} / mês
                  </span>
                </div>
                <div className="px-4 text-center border-l border-primary/20">
                  <span className="text-xs text-primary font-semibold uppercase block mb-1">Alíquota Efetiva ✦</span>
                  <span className="text-xl font-black text-primary">{(formData.effective_rate || 0).toFixed(2)}%</span>
                </div>
              </div>
              <button onClick={() => setStep(3)} className="ml-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 rounded">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <Button 
          size="lg" 
          onClick={onSubmit} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-white w-full max-w-sm h-14 text-lg"
        >
          {isLoading ? (
            <Loader2 className="mr-2 w-6 h-6 animate-spin" />
          ) : (
            <>
              Concluir Configuração
              <ArrowRight className="ml-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
