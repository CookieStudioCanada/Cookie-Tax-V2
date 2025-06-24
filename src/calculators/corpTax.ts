interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

interface CorpTaxInput {
  // Income sources
  activeBusinessIncome: number;
  investmentIncome: number;
  portfolioDividends: number;
  eligibleDividends: number;
  foreignIncome: number;
  capitalGains: number;
  rentalIncome: number;
  
  // Corporation details
  taxableCapital: number;
  associatedCorporations: boolean;
  associatedGroupTaxableCapital: number;
  ccpcStatus: boolean;
  manufacturingProcessingIncome: number;
  
  // Small Business Deduction
  sbdEligibilityPercentage: number;
  passiveInvestmentIncome: number; // AII for SBD reduction
  priorYearSBDUsed: number;
  
  // Investment income details
  aggregateInvestmentIncome: number;
  partIVTax: number;
  refundableTaxBalance: number;
  
  // RDTOH tracking
  eligibleRDTOH: number;
  nonEligibleRDTOH: number;
  dividendsPaidEligible: number;
  dividendsPaidNonEligible: number;
  
  // GRIP/LRIP
  priorGRIPBalance: number;
  priorLRIPBalance: number;
  
  // Deductions and credits
  scientificResearchCredits: number;
  investmentTaxCredits: number;
  foreignTaxCredits: number;
  donationsCarriedForward: number;
  lossesCarriedForward: number;
  
  // Special situations
  manufacturingAndProcessing: boolean;
  resourceIncome: number;
  farmingIncome: number;
  fishingIncome: number;
  
  // Inter-corporate transactions
  dividendsReceived: number;
  dividendsDeductible: boolean;
  
  // Advanced calculations
  alternativeMinimumTax: boolean;
  controlChanged: boolean;
  windingUp: boolean;
  acquisitionOfControl: string; // Date
  
  // Provincial considerations
  province: 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  permanentEstablishment: number; // Percentage in province
  
  notes: string;
}

interface DetailedTaxBreakdown {
  // Income breakdown
  totalIncome: number;
  taxableIncome: number;
  activeBusinessIncome: number;
  investmentIncome: number;
  
  // Federal tax components
  basicFederalTax: number; // 38%
  federalAbatement: number; // -10%
  generalRateReduction: number; // -13%
  manufacturingReduction: number; // Additional M&P reduction
  
  // Small Business Deduction
  sbdEligibleIncome: number;
  sbdReduction: number;
  effectiveSBDRate: number;
  
  // Investment income tax
  refundableTaxPart1: number; // 10⅔%
  refundableTaxPart4: number; // 38⅓%
  additionalRefundableTax: number; // 30⅔%
  
  // RDTOH calculations
  rdtohAdditions: number;
  rdtohReductions: number;
  endingEligibleRDTOH: number;
  endingNonEligibleRDTOH: number;
  
  // GRIP/LRIP
  gripAdditions: number;
  gripReductions: number;
  endingGRIP: number;
  lripAdditions: number;
  endingLRIP: number;
  
  // Provincial calculations
  provincialBaseRate: number;
  provincialSBDRate: number;
  provincialGeneralRate: number;
  
  // Final tax calculation
  federalTaxPayable: number;
  provincialTaxPayable: number;
  totalTaxPayable: number;
  
  // Integration calculations
  dividendRefundEligible: number;
  dividendRefundNonEligible: number;
  integrationAccount: number;
  
  // Compliance metrics
  effectiveTaxRate: number;
  marginalTaxRate: number;
  cashTaxRate: number;
}

interface CorpTaxOutput {
  federalTax: number;
  provincialTax: number;
  grip: number;
  lrip: number;
  breakdown: DetailedTaxBreakdown;
  validationErrors: ValidationError[];
  warnings: string[];
  optimizations: string[];
}

function validateCorpTaxInput(input: CorpTaxInput): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Basic income validations
  if (input.activeBusinessIncome < 0) {
    errors.push({
      field: 'activeBusinessIncome',
      message: 'Active business income cannot be negative',
      severity: 'error',
      code: 'NEGATIVE_ABI'
    });
  }
  
  if (input.investmentIncome < 0) {
    errors.push({
      field: 'investmentIncome',
      message: 'Investment income cannot be negative',
      severity: 'error',
      code: 'NEGATIVE_INVESTMENT'
    });
  }
  
  // CCPC status validations
  if (!input.ccpcStatus && input.activeBusinessIncome > 0) {
    errors.push({
      field: 'ccpcStatus',
      message: 'Active business income typically requires CCPC status for SBD',
      severity: 'warning',
      code: 'NON_CCPC_ABI'
    });
  }
  
  // Small Business Deduction validations
  if (input.activeBusinessIncome > 500000 && input.sbdEligibilityPercentage > 0) {
    errors.push({
      field: 'sbdEligibilityPercentage',
      message: 'SBD only applies to first $500,000 of active business income',
      severity: 'info',
      code: 'SBD_LIMIT'
    });
  }
  
  if (input.sbdEligibilityPercentage < 0 || input.sbdEligibilityPercentage > 100) {
    errors.push({
      field: 'sbdEligibilityPercentage',
      message: 'SBD eligibility must be between 0% and 100%',
      severity: 'error',
      code: 'INVALID_SBD_PERCENTAGE'
    });
  }
  
  // Taxable capital validations
  if (input.taxableCapital > 10000000) {
    errors.push({
      field: 'taxableCapital',
      message: 'SBD reduces for taxable capital between $10M and $15M',
      severity: 'warning',
      code: 'HIGH_TAXABLE_CAPITAL'
    });
  }
  
  if (input.taxableCapital >= 15000000) {
    errors.push({
      field: 'taxableCapital',
      message: 'No SBD available with taxable capital ≥$15M',
      severity: 'warning',
      code: 'SBD_ELIMINATED'
    });
  }
  
  // Passive income validations
  if (input.passiveInvestmentIncome > 50000) {
    errors.push({
      field: 'passiveInvestmentIncome',
      message: 'SBD reduces dollar-for-dollar for AII over $50,000',
      severity: 'warning',
      code: 'PASSIVE_INCOME_GRINDING'
    });
  }
  
  if (input.passiveInvestmentIncome >= 150000) {
    errors.push({
      field: 'passiveInvestmentIncome',
      message: 'SBD completely eliminated with AII ≥$150,000',
      severity: 'warning',
      code: 'SBD_PASSIVE_ELIMINATION'
    });
  }
  
  // Associated corporation validations
  if (input.associatedCorporations && input.associatedGroupTaxableCapital > 10000000) {
    errors.push({
      field: 'associatedGroupTaxableCapital',
      message: 'Associated group taxable capital may affect SBD allocation',
      severity: 'warning',
      code: 'ASSOCIATED_CAPITAL_IMPACT'
    });
  }
  
  // RDTOH validations
  if (input.eligibleRDTOH < 0 || input.nonEligibleRDTOH < 0) {
    errors.push({
      field: 'rdtohBalance',
      message: 'RDTOH balances cannot be negative',
      severity: 'error',
      code: 'NEGATIVE_RDTOH'
    });
  }
  
  // Dividend validations
  if (input.dividendsPaidEligible > 0 && input.priorGRIPBalance === 0) {
    errors.push({
      field: 'dividendsPaidEligible',
      message: 'Eligible dividends require sufficient GRIP balance',
      severity: 'warning',
      code: 'INSUFFICIENT_GRIP'
    });
  }
  
  // Provincial allocation validations
  if (input.permanentEstablishment < 0 || input.permanentEstablishment > 100) {
    errors.push({
      field: 'permanentEstablishment',
      message: 'Permanent establishment percentage must be between 0% and 100%',
      severity: 'error',
      code: 'INVALID_PE_ALLOCATION'
    });
  }
  
  // Control change validations
  if (input.controlChanged && input.lossesCarriedForward > 0) {
    errors.push({
      field: 'controlChanged',
      message: 'Loss restrictions may apply following acquisition of control',
      severity: 'warning',
      code: 'CONTROL_CHANGE_LOSSES'
    });
  }
  
  // Manufacturing and processing validations
  if (input.manufacturingProcessingIncome > input.activeBusinessIncome) {
    errors.push({
      field: 'manufacturingProcessingIncome',
      message: 'M&P income cannot exceed active business income',
      severity: 'error',
      code: 'MP_EXCEEDS_ABI'
    });
  }
  
  return errors;
}

function calculateSmallBusinessDeduction(input: CorpTaxInput): { sbdIncome: number; sbdAmount: number; effectiveRate: number } {
  // Base SBD limit
  let sbdLimit = 500000;
  
  // Taxable capital grinding (s.125(5.1))
  if (input.taxableCapital > 10000000) {
    const reduction = Math.min(500000, (input.taxableCapital - 10000000) * 5);
    sbdLimit = Math.max(0, sbdLimit - reduction);
  }
  
  // Associated corporation adjustment
  if (input.associatedCorporations && input.associatedGroupTaxableCapital > 10000000) {
    const associatedReduction = Math.min(500000, (input.associatedGroupTaxableCapital - 10000000) * 5);
    sbdLimit = Math.max(0, sbdLimit - associatedReduction);
  }
  
  // Passive income grinding (s.125(5.1))
  if (input.passiveInvestmentIncome > 50000) {
    const passiveReduction = Math.min(sbdLimit, (input.passiveInvestmentIncome - 50000) * 5);
    sbdLimit = Math.max(0, sbdLimit - passiveReduction);
  }
  
  // Calculate eligible income
  const sbdEligibleIncome = Math.min(
    input.activeBusinessIncome,
    sbdLimit,
    500000 - input.priorYearSBDUsed
  ) * (input.sbdEligibilityPercentage / 100);
  
  // Federal SBD: 9% reduction from 38% base rate
  const federalSBDRate = 0.09;
  const sbdAmount = sbdEligibleIncome * federalSBDRate;
  
  // Effective rate including provincial SBD
  const provincialSBDRates: Record<string, number> = {
    'QC': 0.032, 'ON': 0.032, 'BC': 0.02, 'AB': 0.02, 'SK': 0.02,
    'MB': 0.00, 'NB': 0.025, 'NS': 0.025, 'PE': 0.035, 'NL': 0.03,
    'NT': 0.04, 'NU': 0.04, 'YT': 0.025
  };
  
  const provincialSBDRate = provincialSBDRates[input.province] || 0.03;
  const effectiveRate = federalSBDRate + provincialSBDRate;
  
  return {
    sbdIncome: sbdEligibleIncome,
    sbdAmount,
    effectiveRate
  };
}

function calculateInvestmentIncomeTax(input: CorpTaxInput): { 
  partIRefundable: number; 
  partIVTax: number; 
  additionalRefundable: number;
  totalInvestmentTax: number;
} {
  // Part I refundable tax: 10⅔% on aggregate investment income
  const partIRefundable = input.aggregateInvestmentIncome * (10.67 / 100);
  
  // Part IV tax: 38⅓% on portfolio dividends
  const partIVTax = input.portfolioDividends * (38.33 / 100);
  
  // Additional refundable tax: 30⅔% on investment income
  const basicRate = 0.38; // 38% basic rate
  const federalAbatement = 0.10; // 10% federal abatement
  const generalRateReduction = 0.13; // 13% general rate reduction
  
  const netRate = basicRate - federalAbatement - generalRateReduction; // 15%
  const additionalRefundable = input.investmentIncome * (30.67 / 100);
  
  const totalInvestmentTax = partIRefundable + partIVTax + additionalRefundable;
  
  return {
    partIRefundable,
    partIVTax,
    additionalRefundable,
    totalInvestmentTax
  };
}

function calculateRDTOH(input: CorpTaxInput, investmentTax: any): {
  eligibleRDTOH: number;
  nonEligibleRDTOH: number;
  dividendRefundEligible: number;
  dividendRefundNonEligible: number;
} {
  // Eligible RDTOH: Part IV tax on eligible dividends
  const eligibleAdditions = input.partIVTax * 0.38; // Simplified
  const eligibleRefund = Math.min(
    input.eligibleRDTOH + eligibleAdditions,
    input.dividendsPaidEligible * (38.33 / 100)
  );
  
  // Non-eligible RDTOH: Part I refundable + Part IV on non-eligible
  const nonEligibleAdditions = investmentTax.partIRefundable + investmentTax.additionalRefundable;
  const nonEligibleRefund = Math.min(
    input.nonEligibleRDTOH + nonEligibleAdditions,
    input.dividendsPaidNonEligible * (38.33 / 100)
  );
  
  return {
    eligibleRDTOH: input.eligibleRDTOH + eligibleAdditions - eligibleRefund,
    nonEligibleRDTOH: input.nonEligibleRDTOH + nonEligibleAdditions - nonEligibleRefund,
    dividendRefundEligible: eligibleRefund,
    dividendRefundNonEligible: nonEligibleRefund
  };
}

function calculateGRIPLRIP(input: CorpTaxInput, sbdResult: any): {
  gripBalance: number;
  lripBalance: number;
  gripAdditions: number;
  lripAdditions: number;
} {
  // GRIP: 72% of income subject to general corporate tax rate
  const generalRateIncome = input.activeBusinessIncome - sbdResult.sbdIncome + input.investmentIncome;
  const gripAdditions = generalRateIncome * 0.72;
  const gripReductions = input.dividendsPaidEligible;
  
  // LRIP: Small business income and certain other amounts
  const lripAdditions = sbdResult.sbdIncome * 0.38; // Simplified
  
  return {
    gripBalance: Math.max(0, input.priorGRIPBalance + gripAdditions - gripReductions),
    lripBalance: input.priorLRIPBalance + lripAdditions,
    gripAdditions,
    lripAdditions
  };
}

export function calcCorpTax(input: CorpTaxInput): CorpTaxOutput {
  const validationErrors = validateCorpTaxInput(input);
  const warnings: string[] = [];
  const optimizations: string[] = [];
  
  // Calculate SBD
  const sbdResult = calculateSmallBusinessDeduction(input);
  
  // Calculate investment income tax
  const investmentTax = calculateInvestmentIncomeTax(input);
  
  // Calculate RDTOH
  const rdtohResult = calculateRDTOH(input, investmentTax);
  
  // Calculate GRIP/LRIP
  const gripLripResult = calculateGRIPLRIP(input, sbdResult);
  
  // Basic federal tax calculation
  const totalIncome = input.activeBusinessIncome + input.investmentIncome + 
                     input.capitalGains * 0.5 + input.foreignIncome;
  
  const basicFederalRate = 0.38; // 38% basic rate
  const federalAbatement = totalIncome * 0.10; // 10% abatement
  
  // General rate reduction (13% on income not eligible for SBD)
  const generalRateIncome = input.activeBusinessIncome - sbdResult.sbdIncome;
  const generalRateReduction = generalRateIncome * 0.13;
  
  // Manufacturing and processing deduction
  const mpDeduction = input.manufacturingAndProcessing ? 
    Math.min(input.manufacturingProcessingIncome, generalRateIncome) * 0.13 : 0;
  
  // Federal tax before credits
  const federalTaxBeforeCredits = (totalIncome * basicFederalRate) - 
                                 federalAbatement - 
                                 generalRateReduction - 
                                 sbdResult.sbdAmount - 
                                 mpDeduction;
  
  // Apply credits
  const federalTax = Math.max(0, federalTaxBeforeCredits - 
                             input.scientificResearchCredits - 
                             input.investmentTaxCredits - 
                             input.foreignTaxCredits) + 
                    investmentTax.totalInvestmentTax;
  
  // Provincial tax calculation
  const provincialGeneralRates: Record<string, number> = {
    'QC': 0.115, 'ON': 0.115, 'BC': 0.12, 'AB': 0.08, 'SK': 0.12,
    'MB': 0.12, 'NB': 0.14, 'NS': 0.14, 'PE': 0.16, 'NL': 0.15,
    'NT': 0.115, 'NU': 0.12, 'YT': 0.025
  };
  
  const provincialSBDRates: Record<string, number> = {
    'QC': 0.032, 'ON': 0.032, 'BC': 0.02, 'AB': 0.02, 'SK': 0.02,
    'MB': 0.00, 'NB': 0.025, 'NS': 0.025, 'PE': 0.035, 'NL': 0.03,
    'NT': 0.04, 'NU': 0.04, 'YT': 0.025
  };
  
  const provincialGeneralRate = provincialGeneralRates[input.province] || 0.115;
  const provincialSBDRate = provincialSBDRates[input.province] || 0.03;
  
  const provincialTax = (sbdResult.sbdIncome * provincialSBDRate) + 
                       (generalRateIncome * provincialGeneralRate) +
                       (input.investmentIncome * provincialGeneralRate);
  
  // Calculate rates
  const totalTax = federalTax + provincialTax;
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;
  const marginalRate = sbdResult.sbdIncome === input.activeBusinessIncome ? 
    (sbdResult.effectiveRate + provincialSBDRate) * 100 :
    (0.27 + provincialGeneralRate) * 100; // 27% federal general rate
  
  // Generate optimizations
  if (input.passiveInvestmentIncome > 40000) {
    optimizations.push('Consider reducing passive investment income to preserve SBD');
  }
  
  if (input.activeBusinessIncome > 500000 && input.sbdEligibilityPercentage < 100) {
    optimizations.push('Maximize SBD eligibility to reduce tax on first $500K');
  }
  
  if (input.manufacturingAndProcessing && input.manufacturingProcessingIncome < input.activeBusinessIncome) {
    optimizations.push('Consider qualifying more income for M&P deduction');
  }
  
  const breakdown: DetailedTaxBreakdown = {
    totalIncome,
    taxableIncome: totalIncome,
    activeBusinessIncome: input.activeBusinessIncome,
    investmentIncome: input.investmentIncome,
    basicFederalTax: totalIncome * basicFederalRate,
    federalAbatement,
    generalRateReduction,
    manufacturingReduction: mpDeduction,
    sbdEligibleIncome: sbdResult.sbdIncome,
    sbdReduction: sbdResult.sbdAmount,
    effectiveSBDRate: sbdResult.effectiveRate,
    refundableTaxPart1: investmentTax.partIRefundable,
    refundableTaxPart4: investmentTax.partIVTax,
    additionalRefundableTax: investmentTax.additionalRefundable,
    rdtohAdditions: investmentTax.partIRefundable + investmentTax.additionalRefundable,
    rdtohReductions: rdtohResult.dividendRefundEligible + rdtohResult.dividendRefundNonEligible,
    endingEligibleRDTOH: rdtohResult.eligibleRDTOH,
    endingNonEligibleRDTOH: rdtohResult.nonEligibleRDTOH,
    gripAdditions: gripLripResult.gripAdditions,
    gripReductions: input.dividendsPaidEligible,
    endingGRIP: gripLripResult.gripBalance,
    lripAdditions: gripLripResult.lripAdditions,
    endingLRIP: gripLripResult.lripBalance,
    provincialBaseRate: provincialGeneralRate,
    provincialSBDRate,
    provincialGeneralRate,
    federalTaxPayable: federalTax,
    provincialTaxPayable: provincialTax,
    totalTaxPayable: totalTax,
    dividendRefundEligible: rdtohResult.dividendRefundEligible,
    dividendRefundNonEligible: rdtohResult.dividendRefundNonEligible,
    integrationAccount: gripLripResult.gripBalance + gripLripResult.lripBalance,
    effectiveTaxRate: effectiveRate,
    marginalTaxRate: marginalRate,
    cashTaxRate: totalIncome > 0 ? ((totalTax - rdtohResult.dividendRefundEligible - rdtohResult.dividendRefundNonEligible) / totalIncome) * 100 : 0
  };
  
  return {
    federalTax: Math.round(federalTax * 100) / 100,
    provincialTax: Math.round(provincialTax * 100) / 100,
    grip: Math.round(gripLripResult.gripBalance * 100) / 100,
    lrip: Math.round(gripLripResult.lripBalance * 100) / 100,
    breakdown,
    validationErrors,
    warnings,
    optimizations
  };
} 