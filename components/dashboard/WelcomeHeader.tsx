"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface WelcomeHeaderProps {
  companyName: string;
}

export function WelcomeHeader({ companyName }: WelcomeHeaderProps) {
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-secondary">
          Olá, {companyName}! 👋
        </h1>
        <p className="text-zinc-500 mt-1">
          Veja como está a saúde do seu negócio hoje.
        </p>
      </div>
      <div className="mt-4 md:mt-0 text-right">
        <p className="text-sm font-medium text-zinc-600 capitalize">
          {today}
        </p>
        <p className="text-xs text-primary font-semibold flex items-center justify-end mt-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse mr-2"></span>
          Atualizado agora
        </p>
      </div>
    </div>
  )
}
