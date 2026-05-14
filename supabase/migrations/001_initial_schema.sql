-- Supabase Migration: 001_initial_schema.sql

-- ==========================================
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ==========================================

-- Trigger to update "updated_at" column automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Admin check function (requires setting app.settings.admin_email in Supabase)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'email') = current_setting('app.settings.admin_email', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the current user's company_id from user_profiles
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;


-- ==========================================
-- 2. TABLES
-- ==========================================

-- 2.1 Companies
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  plan VARCHAR(20) NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'premium')),
  subscription_status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'past_due')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'owner'
    CHECK (role IN ('owner', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 Fiscal Profiles
CREATE TABLE fiscal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  business_type VARCHAR(20) NOT NULL
    CHECK (business_type IN ('product', 'service', 'both')),
  cnae VARCHAR(10),
  cnae_description TEXT,
  tax_regime VARCHAR(30) NOT NULL
    CHECK (tax_regime IN ('mei', 'simples_nacional', 'lucro_presumido')),
  simples_annex VARCHAR(3)
    CHECK (simples_annex IN ('I', 'II', 'III', 'IV', 'V')),
  fator_r BOOLEAN DEFAULT false,
  effective_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  monthly_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.4 Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  unit VARCHAR(30) DEFAULT 'unidade',
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit_margin NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_profitable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.5 Technical Sheet Items
CREATE TABLE technical_sheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(30) NOT NULL DEFAULT 'unidade',
  quantity NUMERIC(10,4) NOT NULL DEFAULT 1,
  unit_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.6 Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  duration_minutes INTEGER,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit_margin NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_profitable BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.7 Price Calculations
CREATE TABLE price_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  item_name VARCHAR(255) NOT NULL,
  item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('product', 'service')),

  -- Group 1: purchase costs
  purchase_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  icms_entry_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  ipi_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  difal_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  other_purchase_taxes NUMERIC(5,2) NOT NULL DEFAULT 0,
  packaging_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  freight_cost NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Group 2: operational costs
  fixed_expenses_share NUMERIC(12,2) NOT NULL DEFAULT 0,
  variable_expenses_rate NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Group 3: sale taxes
  simples_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  card_fee_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  marketplace_fee_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  other_sale_taxes NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Desired margin
  desired_margin NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Results (calculated)
  real_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  minimum_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  suggested_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  profit_per_unit NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_negative_margin BOOLEAN NOT NULL DEFAULT false,

  -- XML import flag
  imported_from_xml BOOLEAN NOT NULL DEFAULT false,
  xml_invoice_number VARCHAR(50),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.8 Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  asaas_subscription_id VARCHAR(100) UNIQUE,
  asaas_customer_id VARCHAR(100),
  plan VARCHAR(20) NOT NULL DEFAULT 'premium',
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'cancelled', 'past_due')),
  amount NUMERIC(8,2) NOT NULL DEFAULT 39.90,
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
  next_due_date DATE,
  days_overdue INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.9 Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  asaas_payment_id VARCHAR(100) UNIQUE,
  amount NUMERIC(8,2) NOT NULL,
  payment_method VARCHAR(20)
    CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('pending', 'confirmed', 'overdue', 'refunded', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  pix_qr_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.10 Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_via_email BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.11 XML Imports
CREATE TABLE xml_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50),
  supplier_name VARCHAR(255),
  supplier_cnpj VARCHAR(18),
  issue_date DATE,
  total_value NUMERIC(12,2),
  total_icms NUMERIC(12,2),
  total_ipi NUMERIC(12,2),
  items_count INTEGER,
  raw_xml TEXT,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. INDEXES
-- ==========================================

CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_active ON products(company_id, is_active);
CREATE INDEX idx_services_company ON services(company_id);
CREATE INDEX idx_price_calculations_company ON price_calculations(company_id);
CREATE INDEX idx_price_calculations_created ON price_calculations(company_id, created_at DESC);
CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_status ON payments(status, due_date);
CREATE INDEX idx_notifications_company ON notifications(company_id, is_read);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, next_due_date);
CREATE INDEX idx_user_profiles_company ON user_profiles(company_id);
CREATE INDEX idx_tech_sheet_product ON technical_sheet_items(product_id);

-- ==========================================
-- 4. TRIGGERS FOR UPDATED_AT
-- ==========================================

CREATE TRIGGER trg_companies_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_fiscal_profiles_updated_at
BEFORE UPDATE ON fiscal_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_sheet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE xml_imports ENABLE ROW LEVEL SECURITY;

-- 5.1 Admin Bypass Policy (Applied to all tables)
CREATE POLICY "Admin bypass companies" ON companies FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass user_profiles" ON user_profiles FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass fiscal_profiles" ON fiscal_profiles FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass products" ON products FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass technical_sheet_items" ON technical_sheet_items FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass services" ON services FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass price_calculations" ON price_calculations FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass subscriptions" ON subscriptions FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass payments" ON payments FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass notifications" ON notifications FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admin bypass xml_imports" ON xml_imports FOR ALL TO authenticated USING (is_admin());

-- 5.2 Table Specific Policies

-- companies
CREATE POLICY "View own company" ON companies FOR SELECT TO authenticated
  USING (id = get_user_company_id());
CREATE POLICY "Update own company" ON companies FOR UPDATE TO authenticated
  USING (id = get_user_company_id());
CREATE POLICY "Insert company during signup" ON companies FOR INSERT TO authenticated
  WITH CHECK (true); -- Usually restricted by signup function

-- user_profiles
CREATE POLICY "View own profile" ON user_profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Update own profile" ON user_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "Insert own profile" ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- fiscal_profiles
CREATE POLICY "Access own fiscal profile" ON fiscal_profiles FOR ALL TO authenticated
  USING (company_id = get_user_company_id());

-- products
CREATE POLICY "Access own products" ON products FOR ALL TO authenticated
  USING (company_id = get_user_company_id());

-- technical_sheet_items
CREATE POLICY "Access own tech sheet items" ON technical_sheet_items FOR ALL TO authenticated
  USING (product_id IN (SELECT id FROM products WHERE company_id = get_user_company_id()));

-- services
CREATE POLICY "Access own services" ON services FOR ALL TO authenticated
  USING (company_id = get_user_company_id());

-- price_calculations
CREATE POLICY "Access own price calculations" ON price_calculations FOR ALL TO authenticated
  USING (company_id = get_user_company_id());

-- subscriptions
CREATE POLICY "View own subscription" ON subscriptions FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Update own subscription" ON subscriptions FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id());

-- payments
CREATE POLICY "View own payments" ON payments FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

-- notifications
CREATE POLICY "View own notifications" ON notifications FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Update own notifications" ON notifications FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id());

-- xml_imports
CREATE POLICY "Access own xml imports" ON xml_imports FOR ALL TO authenticated
  USING (company_id = get_user_company_id());

-- ==========================================
-- 6. VIEWS
-- ==========================================

CREATE OR REPLACE VIEW admin_companies_overview AS
SELECT
  c.id,
  c.cnpj,
  c.razao_social,
  c.email,
  c.plan,
  c.subscription_status,
  c.is_active,
  c.created_at,
  fp.tax_regime,
  fp.cnae,
  fp.onboarding_completed,
  s.next_due_date,
  s.days_overdue,
  s.amount AS monthly_amount,
  (SELECT COUNT(*) FROM products p WHERE p.company_id = c.id) AS products_count,
  (SELECT COUNT(*) FROM services sv WHERE sv.company_id = c.id) AS services_count,
  (SELECT COUNT(*) FROM price_calculations pc WHERE pc.company_id = c.id) AS calculations_count
FROM companies c
LEFT JOIN fiscal_profiles fp ON fp.company_id = c.id
LEFT JOIN subscriptions s ON s.company_id = c.id;

CREATE OR REPLACE VIEW admin_financial_overview AS
SELECT
  DATE_TRUNC('month', paid_at) AS month,
  COUNT(*) AS payments_count,
  SUM(amount) AS total_revenue,
  COUNT(*) FILTER (WHERE payment_method = 'pix') AS pix_count,
  COUNT(*) FILTER (WHERE payment_method = 'credit_card') AS card_count
FROM payments
WHERE status = 'confirmed'
GROUP BY DATE_TRUNC('month', paid_at)
ORDER BY month DESC;

-- ==========================================
-- 7. SEED DATA
-- ==========================================

DO $$
DECLARE
  v_company_id UUID;
  v_prod1_id UUID;
  v_prod2_id UUID;
  v_prod3_id UUID;
BEGIN
  -- Insert Company
  INSERT INTO companies (cnpj, razao_social, nome_fantasia, email, plan, subscription_status)
  VALUES ('12.345.678/0001-90', 'Loja Teste Ltda', 'Loja Teste', 'teste@lojateste.com.br', 'premium', 'active')
  RETURNING id INTO v_company_id;

  -- Insert Fiscal Profile
  INSERT INTO fiscal_profiles (company_id, business_type, tax_regime, simples_annex, effective_rate, monthly_revenue)
  VALUES (v_company_id, 'product', 'simples_nacional', 'I', 4.5, 15000);

  -- Insert Products
  INSERT INTO products (company_id, name, description, cost_price, selling_price, profit_margin, is_profitable)
  VALUES (v_company_id, 'Produto Premium', 'Produto de alta qualidade', 50.00, 150.00, 55.00, true)
  RETURNING id INTO v_prod1_id;

  INSERT INTO products (company_id, name, description, cost_price, selling_price, profit_margin, is_profitable)
  VALUES (v_company_id, 'Produto Básico', 'Produto de entrada', 20.00, 40.00, 30.00, true)
  RETURNING id INTO v_prod2_id;

  INSERT INTO products (company_id, name, description, cost_price, selling_price, profit_margin, is_profitable)
  VALUES (v_company_id, 'Produto em Prejuízo', 'Produto com margem negativa', 80.00, 75.00, -15.00, false)
  RETURNING id INTO v_prod3_id;

  -- Insert Price Calculations
  INSERT INTO price_calculations (
    company_id, product_id, item_name, item_type,
    purchase_cost, simples_rate, card_fee_rate, desired_margin,
    real_cost, minimum_price, suggested_price, profit_per_unit, is_negative_margin
  ) VALUES (
    v_company_id, v_prod1_id, 'Produto Premium', 'product',
    50.00, 4.5, 2.0, 55.00,
    55.00, 120.00, 150.00, 82.50, false
  );

  INSERT INTO price_calculations (
    company_id, product_id, item_name, item_type,
    purchase_cost, simples_rate, card_fee_rate, desired_margin,
    real_cost, minimum_price, suggested_price, profit_per_unit, is_negative_margin
  ) VALUES (
    v_company_id, v_prod3_id, 'Produto em Prejuízo', 'product',
    80.00, 4.5, 2.0, 20.00,
    88.00, 110.00, 75.00, -13.00, true
  );

END $$;
