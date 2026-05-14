/**
 * Formats a number to Brazilian currency string (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formats a number to a percentage string (12,50%)
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Parses a Brazilian currency/number string back to a float.
 * Handles strings like "1.234,56" or "R$ 1.234,56"
 */
export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  
  // Remove currency symbol and whitespace
  let cleanValue = value.replace('R$', '').trim();
  
  // Replace thousands separator (dot) with nothing and decimal separator (comma) with dot
  cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}
