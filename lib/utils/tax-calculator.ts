export type TaxRegime = 'mei' | 'simples_nacional' | 'lucro_presumido';
export type SimplesAnnex = 'I' | 'II' | 'III' | 'IV' | 'V';

const ANNEX_I = [
  { max: 180000, rate: 0.0400, deduct: 0 },
  { max: 360000, rate: 0.0730, deduct: 5940 },
  { max: 720000, rate: 0.0950, deduct: 13860 },
  { max: 1800000, rate: 0.1070, deduct: 22500 },
  { max: 3600000, rate: 0.1430, deduct: 87300 },
  { max: 4800000, rate: 0.1900, deduct: 378000 },
];

const ANNEX_II = [
  { max: 180000, rate: 0.0450, deduct: 0 },
  { max: 360000, rate: 0.0780, deduct: 5940 },
  { max: 720000, rate: 0.1000, deduct: 13860 },
  { max: 1800000, rate: 0.1120, deduct: 22500 },
  { max: 3600000, rate: 0.1470, deduct: 85500 },
  { max: 4800000, rate: 0.3000, deduct: 720000 },
];

const ANNEX_III = [
  { max: 180000, rate: 0.0600, deduct: 0 },
  { max: 360000, rate: 0.1120, deduct: 9360 },
  { max: 720000, rate: 0.1350, deduct: 17640 },
  { max: 1800000, rate: 0.1600, deduct: 35640 },
  { max: 3600000, rate: 0.2100, deduct: 125640 },
  { max: 4800000, rate: 0.3300, deduct: 648000 },
];

const ANNEX_IV = [
  { max: 180000, rate: 0.0450, deduct: 0 },
  { max: 360000, rate: 0.0900, deduct: 8100 },
  { max: 720000, rate: 0.1020, deduct: 12420 },
  { max: 1800000, rate: 0.1400, deduct: 39780 },
  { max: 3600000, rate: 0.2200, deduct: 183780 },
  { max: 4800000, rate: 0.3300, deduct: 828000 },
];

const ANNEX_V = [
  { max: 180000, rate: 0.1550, deduct: 0 },
  { max: 360000, rate: 0.1800, deduct: 4500 },
  { max: 720000, rate: 0.1950, deduct: 9900 },
  { max: 1800000, rate: 0.2050, deduct: 17100 },
  { max: 3600000, rate: 0.2300, deduct: 62100 },
  { max: 4800000, rate: 0.3050, deduct: 540000 },
];

function getAnnexTable(annex: SimplesAnnex) {
  switch (annex) {
    case 'I': return ANNEX_I;
    case 'II': return ANNEX_II;
    case 'III': return ANNEX_III;
    case 'IV': return ANNEX_IV;
    case 'V': return ANNEX_V;
    default: return ANNEX_I;
  }
}

export function calculateEffectiveRate(
  annex: SimplesAnnex | null,
  monthlyRevenue: number,
  taxRegime: TaxRegime | null
): number {
  if (!taxRegime) return 0;
  if (taxRegime === 'mei') return 0;
  if (taxRegime === 'lucro_presumido') return 0;
  
  if (taxRegime === 'simples_nacional' && annex) {
    const annualRevenue = monthlyRevenue * 12;
    const table = getAnnexTable(annex);
    
    // Find the correct bracket
    let bracket = table[0];
    for (const b of table) {
      if (annualRevenue <= b.max) {
        bracket = b;
        break;
      }
      bracket = b; // keep last if exceeds max
    }

    if (annualRevenue === 0) return bracket.rate * 100;

    // Fórmula: ((RBT12 * Alíquota) - PD) / RBT12
    const effective = ((annualRevenue * bracket.rate) - bracket.deduct) / annualRevenue;
    
    // Ensure it doesn't go below 0 and convert to percentage
    return Math.max(0, effective * 100);
  }

  return 0;
}
