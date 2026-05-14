import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/supabase/auth-helpers"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { PricingCalculator } from "@/components/pricing/PricingCalculator"

export default async function PrecificarPage() {
  const { company, fiscalProfile } = await requireAuth();

  if (!company || !fiscalProfile) {
    redirect('/login');
  }

  const supabase = createClient();

  // Fetch products for linking
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .eq('company_id', company.id)
    .order('name');

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary">Calculadora de Precificação</h1>
        <p className="text-zinc-500 mt-1">
          Calcule seu preço de venda ideal com base em custos reais, impostos e margem desejada.
        </p>
      </div>

      <PricingCalculator 
        fiscalProfile={fiscalProfile} 
        products={products || []}
        plan={company.plan}
      />
    </PageWrapper>
  )
}
