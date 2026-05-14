"use client"

import { CheckCircle2 } from "lucide-react"
import { InfoTooltip } from "@/components/ui/InfoTooltip"

import { OnboardingFormData } from "../OnboardingWizard"

interface Step2Props {
  formData: OnboardingFormData;
  updateData: (data: Partial<OnboardingFormData>) => void;
}

export function Step2TaxRegime({ formData, updateData }: Step2Props) {
  const regimes = [
    {
      id: "mei",
      title: "MEI",
      subtitle: "Microempreendedor Individual",
      description: "Faturamento anual até R$ 81.000",
      detail: "Alíquota fixa mensal por atividade",
      badge: "Mais simples",
    },
    {
      id: "simples_nacional",
      title: "Simples Nacional",
      subtitle: "Micro e pequenas empresas",
      description: "Faturamento anual até R$ 4,8 milhões",
      detail: "Alíquota progressiva por faixa e anexo",
      badge: "Mais popular",
    },
    {
      id: "lucro_presumido",
      title: "Lucro Presumido",
      subtitle: "Médias empresas",
      description: "Sem limite de faturamento",
      detail: "Tributação mais complexa — IRPJ + CSLL + PIS + COFINS",
      badge: "Para maiores",
    }
  ];

  const annexes = [
    { id: "I", name: "Anexo I", desc: "Comércio em geral", rate: "4,0% a 11,2%", color: "bg-blue-500", border: "border-blue-500" },
    { id: "II", name: "Anexo II", desc: "Indústria", rate: "4,5% a 12,1%", color: "bg-amber-500", border: "border-amber-500" },
    { id: "III", name: "Anexo III", desc: "Serviços (com Fator R)", rate: "6,0% a 17,4%", color: "bg-primary", border: "border-primary" },
    { id: "IV", name: "Anexo IV", desc: "Serviços especiais", rate: "4,5% a 16,9%", color: "bg-purple-500", border: "border-purple-500" },
    { id: "V", name: "Anexo V", desc: "Serviços intelectuais", rate: "15,5% a 30,5%", color: "bg-red-500", border: "border-red-500" },
  ];

  const handleRegimeChange = (id: string) => {
    updateData({ 
      tax_regime: id as 'mei' | 'simples_nacional' | 'lucro_presumido',
      simples_annex: null,
      fator_r: false 
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10 pb-10">
      <div>
        <h2 className="text-3xl font-bold text-secondary mb-2">Como sua empresa é tributada?</h2>
        <p className="text-zinc-500">Essas informações serão usadas para calcular impostos automaticamente.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {regimes.map((opt) => {
          const isSelected = formData.tax_regime === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => handleRegimeChange(opt.id)}
              className={`relative cursor-pointer rounded-xl p-6 transition-all duration-200 border-2 ${
                isSelected
                  ? "border-primary bg-green-50 shadow-md transform -translate-y-1"
                  : "border-border bg-white hover:border-primary/50 hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 text-primary">
                  <CheckCircle2 className="w-6 h-6 fill-primary text-white" />
                </div>
              )}
              
              <div className="inline-block px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-full mb-4">
                {opt.badge}
              </div>
              
              <h3 className={`text-xl font-bold mb-1 ${isSelected ? "text-primary" : "text-secondary"}`}>
                {opt.title}
              </h3>
              <p className="text-sm font-medium text-zinc-600 mb-3">{opt.subtitle}</p>
              
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span> {opt.description}
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">•</span> {opt.detail}
                </li>
              </ul>
            </div>
          )
        })}
      </div>

      {formData.tax_regime === 'mei' && (
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in duration-300">
          <h4 className="font-bold text-blue-900 mb-2">Informação sobre o MEI</h4>
          <p className="text-sm text-blue-800">
            O MEI paga uma contribuição mensal fixa:
            <br />• INSS: R$ 75,60 (Comércio/Indústria) ou R$ 79,60 (Serviços)
            <br />• ISS: R$ 5,00 (Serviços)
            <br />O valor do DAS mensal varia conforme a atividade, mas a alíquota em percentual não se aplica diretamente no preço unitário da mesma forma que os outros regimes.
          </p>
        </div>
      )}

      {formData.tax_regime === 'lucro_presumido' && (
        <div className="p-6 bg-amber-50 rounded-xl border border-amber-100 animate-in fade-in duration-300">
          <h4 className="font-bold text-amber-900 mb-2">Atenção ao Lucro Presumido</h4>
          <p className="text-sm text-amber-800">
            No Lucro Presumido, os impostos são calculados sobre uma margem presumida. 
            Como as regras são complexas e envolvem IRPJ, CSLL, PIS e COFINS com alíquotas que dependem de vários fatores da sua empresa, recomendamos consultar seu contador para definir as alíquotas exatas no painel de configurações depois.
          </p>
        </div>
      )}

      {formData.tax_regime === 'simples_nacional' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6 border-t">
          <div>
            <h3 className="text-xl font-bold text-secondary mb-1">
              Qual é o seu Anexo do Simples Nacional?
              <InfoTooltip content="Tabela do Simples Nacional que define sua alíquota conforme o tipo de atividade." />
            </h3>
            <p className="text-sm text-zinc-500">
              Não sabe qual é o seu? Consulte seu contador ou verifique o cartão CNPJ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {annexes.map(anx => {
              const isSelected = formData.simples_annex === anx.id;
              return (
                <div 
                  key={anx.id}
                  onClick={() => updateData({ simples_annex: anx.id as 'I' | 'II' | 'III' | 'IV' | 'V', fator_r: false })}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected ? anx.border + ' bg-zinc-50 shadow-sm' : 'border-border hover:border-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-secondary">{anx.name}</span>
                    {isSelected && <CheckCircle2 className={`w-5 h-5 text-${anx.color.replace('bg-', '')}`} />}
                  </div>
                  <p className="text-xs text-zinc-500 mb-3 h-8">{anx.desc}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${anx.color}`}>
                    {anx.rate}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {formData.tax_regime === 'simples_nacional' && (formData.simples_annex === 'III' || formData.simples_annex === 'V') && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6 border-t">
          <div>
            <h3 className="text-xl font-bold text-secondary mb-1">
              Sua empresa está sujeita ao Fator R?
              <InfoTooltip content="Relação entre sua folha de pagamentos e faturamento. Se ≥ 28%, você pode pagar menos impostos." />
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              Fórmula: Folha de salários ÷ Faturamento últimos 12 meses
            </p>
            
            {formData.simples_annex === 'V' && formData.fator_r === true && (
              <div className="mb-4 p-3 bg-green-50 text-green-800 text-sm rounded-lg border border-green-200">
                💡 <strong>Dica:</strong> Com Fator R aplicável (≥ 28%), você pode ser tributado pelo Anexo III e pagar menos impostos!
              </div>
            )}

            <div className="flex gap-4">
              <div 
                onClick={() => updateData({ fator_r: true })}
                className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${
                  formData.fator_r === true ? 'border-primary bg-green-50 text-primary font-bold' : 'border-border hover:border-zinc-300'
                }`}
              >
                Sim, aplico o Fator R (≥ 28%)
              </div>
              <div 
                onClick={() => updateData({ fator_r: false })}
                className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${
                  formData.fator_r === false ? 'border-primary bg-green-50 text-primary font-bold' : 'border-border hover:border-zinc-300'
                }`}
              >
                Não aplico o Fator R (&lt; 28%)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
