import { createClient } from './server';
import { redirect } from 'next/navigation';
import { Company, FiscalProfile } from '@/types';
import { User } from '@supabase/supabase-js';

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentCompany(): Promise<Company | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', profile.company_id)
    .single();

  return company as Company | null;
}

export async function getFiscalProfile(): Promise<FiscalProfile | null> {
  const company = await getCurrentCompany();
  if (!company) return null;

  const supabase = createClient();
  const { data: fiscalProfile } = await supabase
    .from('fiscal_profiles')
    .select('*')
    .eq('company_id', company.id)
    .single();

  return fiscalProfile as FiscalProfile | null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const supabase = createClient();
  
  // Get company
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single();

  let company: Company | null = null;
  let fiscalProfile: FiscalProfile | null = null;

  if (profile?.company_id) {
    const { data: c } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile.company_id)
      .single();
    company = c as Company;

    if (company) {
      const { data: fp } = await supabase
        .from('fiscal_profiles')
        .select('*')
        .eq('company_id', company.id)
        .single();
      fiscalProfile = fp as FiscalProfile;
    }
  }

  return { user, company, fiscalProfile };
}
