"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, FileText, Settings, BadgePercent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FiscalProfile } from "@/types"

interface FiscalSummaryCardProps {
  fiscalProfile: FiscalProfile;
}

export function FiscalSummaryCard({ fiscalProfile }: FiscalSummaryCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const regimeMap = {
    'mei': 'MEI',
    'simples_nacional': 'Simples Nacional',
    'lucro_presumido': 'Lucro Presumido'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-secondary">Configurações Fiscais Ativas</h3>
            <p className="text-xs text-zinc-500">Seus dados tributários para cálculos automáticos</p>
          </div>
        </div>
        <div className="flex items-center">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-none mr-4">
            Alíquota: {fiscalProfile.effective_rate.toFixed(2)}%
          </Badge>
          {isOpen ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t bg-slate-50/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center">
                <Settings className="w-3 h-3 mr-1" /> Regime
              </span>
              <p className="text-sm font-bold text-secondary">{regimeMap[fiscalProfile.tax_regime]}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center">
                <BadgePercent className="w-3 h-3 mr-1" /> Anexo / Fator R
              </span>
              <p className="text-sm font-bold text-secondary">
                {fiscalProfile.simples_annex ? `Anexo ${fiscalProfile.simples_annex}` : 'N/A'}
                {fiscalProfile.fator_r && ' (Com Fator R)'}
              </p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center">
                <FileText className="w-3 h-3 mr-1" /> CNAE Principal
              </span>
              <p className="text-sm font-bold text-secondary">
                {fiscalProfile.cnae} - {fiscalProfile.cnae_description}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button size="sm" variant="outline" asChild className="text-xs border-primary text-primary hover:bg-primary/5">
              <Link href="/dashboard/onboarding">
                Atualizar perfil fiscal
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
