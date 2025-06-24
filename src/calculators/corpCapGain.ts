interface CorpCapGainInput {
  proceeds: number;
  acb: number; // Adjusted Cost Base
  safeIncomeBump: number;
  vDay: number; // V-day value
  cdaBalance: number; // Capital Dividend Account balance
}

interface CorpCapGainOutput {
  taxableCapitalGain: number;
  cdaAddition: number;
  refundableTax: number;
}

export function calcCorpCapGain({
  proceeds,
  acb,
  safeIncomeBump,
  vDay
}: CorpCapGainInput): CorpCapGainOutput {
  // Calculate capital gain
  const capitalGain = Math.max(0, proceeds - acb - safeIncomeBump);
  
  // V-day adjustment
  const adjustedGain = Math.max(0, capitalGain - Math.max(0, vDay - acb));
  
  // Taxable capital gain (50% inclusion rate)
  const taxableCapitalGain = adjustedGain * 0.5;
  
  // CDA addition (non-taxable portion)
  const cdaAddition = adjustedGain * 0.5;
  
  // Refundable tax (10.67% on investment income)
  const refundableTax = taxableCapitalGain * 0.1067;
  
  return {
    taxableCapitalGain: Math.round(taxableCapitalGain * 100) / 100,
    cdaAddition: Math.round(cdaAddition * 100) / 100,
    refundableTax: Math.round(refundableTax * 100) / 100
  };
} 