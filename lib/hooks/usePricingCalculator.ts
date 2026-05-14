import { useState, useMemo, useCallback } from 'react';
import { TechnicalSheetItem } from '@/types';

export type PricingState = {
  // Item info
  itemName: string;
  itemType: 'product' | 'service';

  // Block 1 — Purchase costs
  purchaseCost: number;
  packagingCost: number;
  freightCost: number;
  icmsEntryRate: number;
  ipiRate: number;
  difalRate: number;
  otherPurchaseTaxes: number;

  // Technical sheet
  technicalSheet: TechnicalSheetItem[];
  useTechnicalSheet: boolean;

  // Block 2 — Operational costs
  fixedExpensesShare: number;
  variableExpensesRate: number;
  cardFeeRate: number;
  marketplaceFeeRate: number;
  otherSaleTaxes: number;

  // Block 3 — Margin
  desiredMargin: number;
  sellingPrice: number;
  marginInputMode: 'percentage' | 'price';
  
  // Fiscal profile (Simples Nacional rate)
  simplesRate: number;
};

export function usePricingCalculator(initialSimplesRate: number = 0) {
  const [state, setState] = useState<PricingState>({
    itemName: '',
    itemType: 'product',
    purchaseCost: 0,
    packagingCost: 0,
    freightCost: 0,
    icmsEntryRate: 0,
    ipiRate: 0,
    difalRate: 0,
    otherPurchaseTaxes: 0,
    technicalSheet: [],
    useTechnicalSheet: false,
    fixedExpensesShare: 0,
    variableExpensesRate: 0,
    cardFeeRate: 2.5,
    marketplaceFeeRate: 0,
    otherSaleTaxes: 0,
    desiredMargin: 20,
    sellingPrice: 0,
    marginInputMode: 'percentage',
    simplesRate: initialSimplesRate,
  });

  const updateState = useCallback((updates: Partial<PricingState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const results = useMemo(() => {
    // 1. Purchase taxes amount
    const totalPurchaseTaxRate = 
      state.icmsEntryRate + state.ipiRate + state.difalRate + state.otherPurchaseTaxes;
    const purchaseTaxesAmount = state.purchaseCost * (totalPurchaseTaxRate / 100);

    // 2. Real cost calculation
    let baseCost = 0;
    if (state.useTechnicalSheet) {
      baseCost = state.technicalSheet.reduce(
        (sum, item) => sum + item.quantity * item.unit_cost, 
        0
      );
    } else {
      baseCost = state.purchaseCost;
    }

    const realCost = 
      baseCost + 
      state.packagingCost + 
      state.freightCost + 
      purchaseTaxesAmount + 
      state.fixedExpensesShare;

    // 3. Sale taxes total rate
    const totalSaleTaxRate = 
      state.simplesRate + 
      state.cardFeeRate + 
      state.marketplaceFeeRate + 
      state.otherSaleTaxes + 
      state.variableExpensesRate;

    // 4. Minimum Price (Break-even)
    const minimumPrice = totalSaleTaxRate >= 100 
      ? 0 
      : realCost / (1 - totalSaleTaxRate / 100);

    // 5. Suggested Price
    const totalMarkupRate = totalSaleTaxRate + state.desiredMargin;
    const suggestedPrice = totalMarkupRate >= 100 
      ? 0 
      : realCost / (1 - totalMarkupRate / 100);

    // 6. Calculations when selling price is manual
    const sellingPrice = state.marginInputMode === 'percentage' 
      ? suggestedPrice 
      : state.sellingPrice;

    let actualMargin = 0;
    let profitPerUnit = 0;
    let isNegativeMargin = false;

    if (sellingPrice > 0) {
      // actualMargin = ((sellingPrice - realCost) / sellingPrice * 100) - totalSaleTaxRate
      actualMargin = ((sellingPrice - realCost) / sellingPrice * 100) - totalSaleTaxRate;
      profitPerUnit = sellingPrice - (sellingPrice * (totalSaleTaxRate / 100)) - realCost;
      isNegativeMargin = profitPerUnit < 0;
    }

    return {
      purchaseTaxesAmount,
      realCost,
      totalSaleTaxRate,
      minimumPrice,
      suggestedPrice,
      actualMargin,
      profitPerUnit,
      isNegativeMargin,
      sellingPrice
    };
  }, [state]);

  const resetCalculator = useCallback(() => {
    setState({
      ...state,
      itemName: '',
      purchaseCost: 0,
      packagingCost: 0,
      freightCost: 0,
      icmsEntryRate: 0,
      ipiRate: 0,
      difalRate: 0,
      otherPurchaseTaxes: 0,
      technicalSheet: [],
      useTechnicalSheet: false,
      fixedExpensesShare: 0,
      variableExpensesRate: 0,
      cardFeeRate: 2.5,
      marketplaceFeeRate: 0,
      otherSaleTaxes: 0,
      desiredMargin: 20,
      sellingPrice: 0,
      marginInputMode: 'percentage',
    });
  }, [state]);

  return {
    state,
    results,
    updateState,
    resetCalculator
  };
}
