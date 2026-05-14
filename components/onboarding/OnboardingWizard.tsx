"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { OnboardingLeftPanel } from "./OnboardingLeftPanel"
import { Step1BusinessType } from "./steps/Step1BusinessType"
import { Step2TaxRegime } from "./steps/Step2TaxRegime"
import { Step3Cnae } from "./steps/Step3Cnae"
import { Step4Confirmation } from "./steps/Step4Confirmation"

export type OnboardingFormData = {
  business_type: 'product' | 'service' | 'both' | null;
  tax_regime: 'mei' | 'simples_nacional' | 'lucro_presumido' | null;
  simples_annex: 'I' | 'II' | 'III' | 'IV' | 'V' | null;
  fator_r: boolean;
  cnae: string;
  cnae_description: string;
  monthly_revenue: number;
  effective_rate: number;
}

const initialData: OnboardingFormData = {
  business_type: null,
  tax_regime: null,
  simples_annex: null,
  fator_r: false,
  cnae: "",
  cnae_description: "",
  monthly_revenue: 0,
  effective_rate: 0
}

interface OnboardingWizardProps {
  companyId: string;
}

export function OnboardingWizard({ companyId }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingFormData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const updateData = (data: Partial<OnboardingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.business_type !== null;
    }
    if (currentStep === 2) {
      if (!formData.tax_regime) return false;
      if (formData.tax_regime === 'simples_nacional') {
        if (!formData.simples_annex) return false;
        if (['III', 'V'].includes(formData.simples_annex)) {
          if (formData.fator_r === undefined || formData.fator_r === null) return false;
        }
      }
      return true;
    }
    if (currentStep === 3) {
      if (!formData.cnae) return false;
      if (formData.tax_regime === 'simples_nacional' && formData.monthly_revenue <= 0) return false;
      return true;
    }
    return true;
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('fiscal_profiles')
        .update({
          business_type: formData.business_type,
          tax_regime: formData.tax_regime,
          simples_annex: formData.simples_annex,
          fator_r: formData.fator_r,
          cnae: formData.cnae,
          cnae_description: formData.cnae_description,
          monthly_revenue: formData.monthly_revenue,
          effective_rate: formData.effective_rate,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId)

      if (error) throw error

      toast.success("Perfil fiscal configurado! Bem-vindo ao PrecifiQ.")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Ocorreu um erro ao salvar seu perfil. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1BusinessType formData={formData} updateData={updateData} />;
      case 2: return <Step2TaxRegime formData={formData} updateData={updateData} />;
      case 3: return <Step3Cnae formData={formData} updateData={updateData} />;
      case 4: return <Step4Confirmation formData={formData} setStep={setCurrentStep} onSubmit={handleSubmit} isLoading={isSubmitting} />;
      default: return null;
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <OnboardingLeftPanel currentStep={currentStep} />
      
      <div className="flex-1 lg:ml-[380px] flex flex-col relative h-full">
        {/* Progress header */}
        <div className="h-20 border-b bg-white px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex flex-col w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Passo {currentStep} de 4</span>
              <span className="text-sm text-zinc-500 font-medium">{Math.round((currentStep / 4) * 100)}% concluído</span>
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" />
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 pb-32">
          <div className="max-w-3xl mx-auto">
            {renderStep()}
          </div>
        </div>

        {/* Bottom Navigation */}
        {currentStep < 4 && (
          <div className="fixed bottom-0 lg:left-[380px] right-0 h-24 border-t bg-white px-8 lg:px-12 flex items-center justify-between z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="text-zinc-600 border-zinc-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Button
              size="lg"
              onClick={handleNext}
              disabled={!isStepValid() || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white min-w-[160px]"
            >
              Próxima etapa
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
