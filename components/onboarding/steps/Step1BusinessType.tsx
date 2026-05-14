"use client"

import { ShoppingBag, Wrench, Zap, CheckCircle2 } from "lucide-react"

import { OnboardingFormData } from "../OnboardingWizard"

interface Step1Props {
  formData: OnboardingFormData;
  updateData: (data: Partial<OnboardingFormData>) => void;
}

export function Step1BusinessType({ formData, updateData }: Step1Props) {
  const options = [
    {
      id: "product",
      title: "Produto",
      description: "Vendo mercadorias físicas para meus clientes",
      icon: ShoppingBag,
    },
    {
      id: "service",
      title: "Serviço",
      description: "Presto serviços ao cliente (mão de obra, consultoria etc.)",
      icon: Wrench,
    },
    {
      id: "both",
      title: "Produto e Serviço",
      description: "Meu negócio envolve tanto venda de produtos quanto serviços",
      icon: Zap,
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-secondary mb-2">Qual é o tipo do seu negócio?</h2>
        <p className="text-zinc-500">Esta informação define quais campos aparecerão na calculadora.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => {
          const isSelected = formData.business_type === opt.id;
          const Icon = opt.icon;

          return (
            <div
              key={opt.id}
              onClick={() => updateData({ business_type: opt.id as 'product' | 'service' | 'both' })}
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
              
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                isSelected ? "bg-primary/20 text-primary" : "bg-zinc-100 text-zinc-600"
              }`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <h3 className={`text-lg font-bold mb-2 ${isSelected ? "text-primary" : "text-secondary"}`}>
                {opt.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-snug">
                {opt.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
