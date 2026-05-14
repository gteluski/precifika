import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Get company
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const companyId = profile.company_id;

    // Check plan limits
    const { data: company } = await supabase
      .from('companies')
      .select('plan')
      .eq('id', companyId)
      .single();

    if (company?.plan === 'free') {
      if (body.itemType === 'product') {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId);

        if (count && count >= 20) {
          return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 403 });
        }
      } else if (body.itemType === 'service') {
        const { count } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId);

        if (count && count >= 1) {
          return NextResponse.json({ error: 'LIMIT_REACHED' }, { status: 403 });
        }
      }
    }

    // Insert calculation
    const { data: calculation, error: calcError } = await supabase
      .from('price_calculations')
      .insert({
        company_id: companyId,
        product_id: body.productId || null,
        product_name: body.itemName,
        purchase_cost: body.purchaseCost,
        purchase_taxes: {
          icms_entry: body.icmsEntryRate,
          ipi: body.ipiRate,
          difal: body.difalRate,
          other: body.otherPurchaseTaxes
        },
        fixed_expenses: body.fixedExpensesShare,
        variable_expenses: body.variableExpensesRate,
        desired_margin: body.desiredMargin,
        sale_taxes: {
          simples_rate: body.simplesRate,
          card_fee: body.cardFeeRate,
          marketplace_fee: body.marketplaceFeeRate,
          other: body.otherSaleTaxes
        },
        real_cost: body.realCost,
        minimum_price: body.minimumPrice,
        suggested_price: body.suggestedPrice,
        selling_price: body.sellingPrice,
        profit_per_unit: body.profitPerUnit,
        is_negative_margin: body.isNegativeMargin
      })
      .select()
      .single();

    if (calcError) throw calcError;

    // If linked to product, update product
    if (body.productId) {
      const margin = ((body.sellingPrice - body.realCost) / body.sellingPrice * 100) - body.totalSaleTaxRate;
      
      await supabase
        .from('products')
        .update({
          selling_price: body.sellingPrice,
          profit_margin: margin,
          is_profitable: !body.isNegativeMargin,
          updated_at: new Date().toISOString()
        })
        .eq('id', body.productId);
    }

    return NextResponse.json({ success: true, calculationId: calculation.id });

  } catch (error: unknown) {
    console.error('Save pricing error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', message }, { status: 500 });
  }
}
