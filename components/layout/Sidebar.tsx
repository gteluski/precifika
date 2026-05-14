"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Wrench,
  Calculator,
  BarChart3,
  Settings,
  CreditCard,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    label: 'Produtos',
    icon: Package,
    href: '/produtos',
  },
  {
    label: 'Serviços',
    icon: Wrench,
    href: '/servicos',
  },
  {
    label: 'Precificar',
    icon: Calculator,
    href: '/precificar',
  },
  {
    label: 'Relatórios',
    icon: BarChart3,
    href: '/relatorios',
  },
  {
    label: 'Conteúdo Educacional',
    icon: BookOpen,
    href: '/conteudo-educacional',
  },
  {
    label: 'Configurações',
    icon: Settings,
    href: '/configuracoes',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  // Placeholder for plan
  const plan = 'free'

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white text-secondary border-r shadow-sm">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold text-primary">PrecifiQ</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href ? "text-primary bg-primary/10" : "text-zinc-600"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", pathname === route.href ? "text-primary" : "text-zinc-500")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-start gap-2">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-semibold">Seu Plano</span>
            <Badge variant={plan === 'free' ? 'secondary' : 'default'} className={plan === 'free' ? 'bg-slate-200 text-slate-700' : 'bg-accent text-accent-foreground'}>
              {plan === 'free' ? 'Grátis' : 'Premium'}
            </Badge>
          </div>
          {plan === 'free' && (
            <Button className="w-full mt-2 bg-accent hover:bg-accent/90 text-white" size="sm" asChild>
              <Link href="/planos">
                <CreditCard className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
