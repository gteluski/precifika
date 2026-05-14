"use client"

import { CheckCircle2, Circle, Briefcase, FileText, Settings, CheckSquare } from "lucide-react"

interface OnboardingLeftPanelProps {
  currentStep: number;
}

export function OnboardingLeftPanel({ currentStep }: OnboardingLeftPanelProps) {
  const steps = [
    { num: 1, label: "Tipo de negócio", icon: Briefcase },
    { num: 2, label: "Regime tributário", icon: FileText },
    { num: 3, label: "CNAE e configuração fiscal", icon: Settings },
    { num: 4, label: "Confirmação", icon: CheckSquare },
  ];

  return (
    <div className="hidden lg:flex flex-col w-[380px] bg-[#0F2744] text-white p-10 h-full fixed left-0 top-0 overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-8">PrecifiQ</h1>
        <h2 className="text-2xl font-bold mb-4 leading-tight">Configure seu perfil fiscal.</h2>
        <p className="text-blue-100 text-sm mb-12 opacity-80">
          Essas informações permitem que a plataforma calcule impostos e alíquotas automaticamente para você.
        </p>

        <div className="space-y-8">
          {steps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isActive = currentStep === step.num;

            return (
              <div key={step.num} className="flex items-center">
                <div className="relative flex items-center justify-center w-10 h-10 mr-4">
                  {isCompleted ? (
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  ) : isActive ? (
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center bg-primary/20 text-primary font-bold text-sm">
                      {step.num}
                    </div>
                  ) : (
                    <Circle className="w-8 h-8 text-blue-800" />
                  )}
                  {step.num !== steps.length && (
                    <div className={`absolute top-10 left-1/2 w-0.5 h-8 -translate-x-1/2 ${isCompleted ? 'bg-primary' : 'bg-blue-800'}`} />
                  )}
                </div>
                <div className={`flex flex-col ${isActive ? 'opacity-100' : isCompleted ? 'opacity-70' : 'opacity-40'}`}>
                  <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold mb-0.5">Etapa {step.num}</span>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-auto pt-12">
        <p className="text-xs text-blue-300 opacity-60">
          Seus dados estão seguros e serão utilizados apenas para fins de cálculos tributários, de acordo com a LGPD.
        </p>
      </div>
    </div>
  )
}
