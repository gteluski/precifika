import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/supabase/auth-helpers"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader"
import { MetricCards } from "@/components/dashboard/MetricCards"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { RecentCalculations } from "@/components/dashboard/RecentCalculations"
import { AlertsPanel } from "@/components/dashboard/AlertsPanel"
import { FiscalSummaryCard } from "@/components/dashboard/FiscalSummaryCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export default async function DashboardPage() {
  const { company, fiscalProfile } = await requireAuth();

  if (!company || !fiscalProfile) {
    redirect('/login');
  }

  const supabase = createClient();

  // Fetch metrics
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id);

  const { count: servicesCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id);

  const { data: calculations } = await supabase
    .from('price_calculations')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { count: negativeMarginsCount } = await supabase
    .from('price_calculations')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .eq('is_negative_margin', true);

  // Calculate average margin
  const { data: allCalcs } = await supabase
    .from('price_calculations')
    .select('selling_price, real_cost')
    .eq('company_id', company.id)
    .limit(100);

  let averageMargin = 0;
  if (allCalcs && allCalcs.length > 0) {
    const totalMargin = allCalcs.reduce((sum, c) => {
      if (c.selling_price === 0) return sum;
      return sum + ((c.selling_price - c.real_cost) / c.selling_price * 100);
    }, 0);
    averageMargin = totalMargin / allCalcs.length;
  }

  // Dummy alerts for now
  const alerts: { id: string; type: 'danger' | 'warning' | 'info'; title: string; description: string; timestamp: string; }[] = [];
  if (negativeMarginsCount && negativeMarginsCount > 0) {
    alerts.push({
      id: '1',
      type: 'danger',
      title: 'Margem Negativa Detectada',
      description: `Você possui ${negativeMarginsCount} cálculo(s) com margem de lucro negativa.`,
      timestamp: 'Hoje'
    });
  }
  
  if (company.plan === 'free' && (productsCount || 0) >= 18) {
    alerts.push({
      id: '2',
      type: 'warning',
      title: 'Limite de Plano Próximo',
      description: `Você usou ${(productsCount || 0)} de 20 produtos do seu plano gratuito.`,
      timestamp: 'Agora'
    });
  }

  return (
    <PageWrapper>
      <WelcomeHeader companyName={company.nome_fantasia || company.razao_social} />
      
      {company.plan === 'free' && (productsCount || 0) >= 18 && (
        <div className={cn(
          "mb-6 p-4 rounded-xl flex items-center justify-between border-2",
          (productsCount || 0) >= 20 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
        )}>
          <p className={cn(
            "text-sm font-bold",
            (productsCount || 0) >= 20 ? "text-red-700" : "text-amber-700"
          )}>
            {(productsCount || 0) >= 20 
              ? `Você atingiu o limite de 20 produtos do plano gratuito.` 
              : `Você está se aproximando do limite do plano gratuito (${productsCount}/20 produtos).`}
            {" "}Faça upgrade para continuar cadastrando sem limites.
          </p>
          <Button asChild size="sm" className={(productsCount || 0) >= 20 ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}>
            <Link href="/planos">
              Fazer upgrade
              <ArrowUpRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}

      <MetricCards 
        productsCount={productsCount || 0}
        servicesCount={servicesCount || 0}
        averageMargin={averageMargin}
        negativeMarginsCount={negativeMarginsCount || 0}
        plan={company.plan}
      />

      <QuickActions plan={company.plan} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentCalculations calculations={calculations || []} />
        </div>
        <div className="lg:col-span-1">
          <AlertsPanel alerts={alerts} />
        </div>
      </div>

      <FiscalSummaryCard fiscalProfile={fiscalProfile} />
    </PageWrapper>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
