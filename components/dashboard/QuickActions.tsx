"use client"

import Link from "next/link"
import { Plus, Calculator, FileUp, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface QuickActionsProps {
  plan: 'free' | 'premium';
}

export function QuickActions({ plan }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <Button asChild className="bg-primary hover:bg-primary/90 text-white">
        <Link href="/produtos/novo">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Link>
      </Button>

      <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
        <Link href="/servicos/novo">
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Link>
      </Button>

      <Button asChild variant="secondary" className="bg-secondary hover:bg-secondary/90 text-white">
        <Link href="/precificar">
          <Calculator className="w-4 h-4 mr-2" />
          Precificar Agora
        </Link>
      </Button>

      <div className="relative group">
        <Button 
          variant="outline" 
          disabled={plan === 'free'}
          className={plan === 'free' ? "bg-zinc-50 text-zinc-400 border-zinc-200" : ""}
        >
          <FileUp className="w-4 h-4 mr-2" />
          Importar XML
          {plan === 'free' && (
            <Badge className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100 border-none flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </Button>
        {plan === 'free' && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-zinc-800 text-white text-[10px] rounded shadow-lg z-50">
            A importação de XML está disponível apenas no plano Premium.
          </div>
        )}
      </div>
    </div>
  )
}
