import { CheckCircle2 } from "lucide-react";

interface AuthLeftPanelProps {
  title?: string;
  showFeatures?: boolean;
}

export function AuthLeftPanel({ title = "PrecifiQ", showFeatures = true }: AuthLeftPanelProps) {
  const features = [
    "Diagnóstico fiscal completo com CNAE e alíquota",
    "Calculadora com dois grupos de imposto",
    "Alerta automático de margem negativa",
    "Importação de XML de nota fiscal (Premium)",
    "IA para sugestão de preço por segmento (Premium)"
  ];

  return (
    <div className="hidden md:flex flex-col justify-between w-2/5 bg-[#0F2744] text-white p-12">
      <div>
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-blue-100 mb-12">
          A plataforma definitiva para precificar seus produtos e serviços com inteligência.
        </p>
        
        {showFeatures && (
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-primary mr-3 flex-shrink-0" />
                <span className="text-blue-50 text-lg leading-tight">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="text-sm text-blue-300">
        &copy; {new Date().getFullYear()} PrecifiQ. Todos os direitos reservados.
      </div>
    </div>
  );
}
