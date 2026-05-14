export interface Company {
  id: string
  cnpj: string
  razao_social: string
  nome_fantasia: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  plan: 'free' | 'premium'
  subscription_status: 'active' | 'suspended' | 'cancelled' | 'past_due'
  created_at: string
}

export interface FiscalProfile {
  id: string
  company_id: string
  business_type: 'product' | 'service' | 'both'
  cnae: string
  cnae_description: string
  tax_regime: 'mei' | 'simples_nacional' | 'lucro_presumido'
  simples_annex: 'I' | 'II' | 'III' | 'IV' | 'V' | null
  fator_r: boolean | null
  effective_rate: number
  monthly_revenue: number
  onboarding_completed: boolean
  created_at: string
}

export interface Product {
  id: string
  company_id: string
  name: string
  description: string
  cost_price: number
  selling_price: number
  profit_margin: number
  is_profitable: boolean
  technical_sheet: TechnicalSheetItem[]
  created_at: string
  updated_at: string
}

export interface TechnicalSheetItem {
  id: string
  name: string
  unit: string
  quantity: number
  unit_cost: number
  total_cost: number
}

export interface PriceCalculation {
  id: string
  company_id: string
  product_id: string | null
  product_name: string
  purchase_cost: number
  purchase_taxes: PurchaseTaxes
  fixed_expenses: number
  variable_expenses: number
  desired_margin: number
  sale_taxes: SaleTaxes
  real_cost: number
  minimum_price: number
  suggested_price: number
  selling_price: number
  profit_per_unit: number
  is_negative_margin: boolean
  created_at: string
}

export interface PurchaseTaxes {
  icms_entry: number
  ipi: number
  difal: number
  other: number
}

export interface SaleTaxes {
  simples_rate: number
  card_fee: number
  marketplace_fee: number
  other: number
}

export interface Subscription {
  id: string
  company_id: string
  asaas_subscription_id: string
  plan: 'premium'
  status: 'active' | 'suspended' | 'cancelled' | 'past_due'
  amount: number
  billing_cycle: 'monthly'
  next_due_date: string
  days_overdue: number
  created_at: string
}
