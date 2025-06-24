import rates from "@/rates/2025.json";

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

interface TaxInput {
  // Income sources
  salary: number;
  eligibleDiv: number;
  nonEligibleDiv: number;
  otherIncome: number;
  capitalGains: number;
  foreignIncome: number;
  rentalIncome: number;
  businessIncome: number;
  pensionIncome: number;
  
  // Employment details
  employmentInsurancePremiums: number;
  cppContributions: number;
  unionDues: number;
  professionalFees: number;
  employmentExpenses: number;
  
  // Deductions
  rrspContribution: number;
  cppExcessContribution: number;
  employmentInsuranceExcess: number;
  carryingCharges: number;
  supportPayments: number;
  movingExpenses: number;
  childCareExpenses: number;
  
  // Tax credits
  spouseAmount: boolean;
  spouseIncome: number;
  dependentChildren: number;
  childrenOver18: number;
  caregiver: boolean;
  disability: boolean;
  disabilityTransfer: number;
  tuitionFees: number;
  medicalExpenses: number;
  charitableDonations: number;
  politicalContributions: number;
  
  // Advanced inputs
  alternativeMinimumTax: boolean;
  foreignTaxCredits: number;
  previousYearMinimumTax: number;
  otherCredits: number;
  
  // Personal information
  age: number;
  province: 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  maritalStatus: 'single' | 'married' | 'common_law' | 'divorced' | 'separated' | 'widowed';
  isResident: boolean;
  immigrationDate?: string;
  emigrationDate?: string;
  
  // Special situations
  fishingCredits: number;
  farmingIncome: number;
  artistCredits: number;
  workersSafetyInsurance: number;
  employmentInsuranceBenefits: number;
  socialAssistance: number;
  
  notes: string;
}

interface TaxCalculationBreakdown {
  // Income breakdown
  totalIncome: number;
  netIncome: number;
  taxableIncome: number;
  
  // Tax before credits
  federalTaxBeforeCredits: number;
  provincialTaxBeforeCredits: number;
  totalTaxBeforeCredits: number;
  
  // Credits
  basicPersonalAmount: number;
  spouseCredit: number;
  dependentCredit: number;
  ageCredit: number;
  pensionCredit: number;
  disabilityCredit: number;
  tuitionCredit: number;
  medicalCredit: number;
  charitableCredit: number;
  employmentCredit: number;
  cppEiCredit: number;
  
  totalNonRefundableCredits: number;
  
  // Refundable credits
  childBenefit: number;
  gstCredit: number;
  workingIncomeCredit: number;
  totalRefundableCredits: number;
  
  // Final calculations
  federalTax: number;
  provincialTax: number;
  totalTax: number;
  marginalTaxRate: number;
  averageeTaxRate: number;
  
  // AMT calculations
  amtAdjustedTaxableIncome: number;
  amtTax: number;
  amtCarryforward: number;
  
  // Summary
  netTaxOwed: number;
  refundDue: number;
}

interface TaxOutput {
  netTax: number;
  marginalRate?: number;
  effectiveRate?: number;
  breakdown: TaxCalculationBreakdown;
  validationErrors: ValidationError[];
  warnings: string[];
  optimizations: string[];
}

// Enhanced validation functions
function validateTaxInput(input: TaxInput): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Income validations
  if (input.salary < 0) {
    errors.push({
      field: 'salary',
      message: 'Salary cannot be negative',
      severity: 'error',
      code: 'NEGATIVE_INCOME'
    });
  }
  
  if (input.salary > 10000000) {
    errors.push({
      field: 'salary',
      message: 'Salary amount appears unreasonably high',
      severity: 'warning',
      code: 'HIGH_INCOME'
    });
  }
  
  if (input.eligibleDiv < 0 || input.nonEligibleDiv < 0) {
    errors.push({
      field: 'dividends',
      message: 'Dividend amounts cannot be negative',
      severity: 'error',
      code: 'NEGATIVE_DIVIDENDS'
    });
  }
  
  if (input.capitalGains < 0) {
    errors.push({
      field: 'capitalGains',
      message: 'Use capital losses field for negative amounts',
      severity: 'warning',
      code: 'NEGATIVE_CAPITAL_GAINS'
    });
  }
  
  // Age validations
  if (input.age < 0 || input.age > 150) {
    errors.push({
      field: 'age',
      message: 'Age must be between 0 and 150',
      severity: 'error',
      code: 'INVALID_AGE'
    });
  }
  
  if (input.age < 18 && input.salary > 0) {
    errors.push({
      field: 'age',
      message: 'Employment income for minors may be subject to kiddie tax rules',
      severity: 'warning',
      code: 'MINOR_INCOME'
    });
  }
  
  // RRSP contribution validations
  const rrspLimit2024 = 31560; // 2024 RRSP limit
  if (input.rrspContribution > rrspLimit2024) {
    errors.push({
      field: 'rrspContribution',
      message: `RRSP contribution exceeds 2024 limit of $${rrspLimit2024.toLocaleString()}`,
      severity: 'warning',
      code: 'EXCESS_RRSP'
    });
  }
  
  if (input.rrspContribution > input.salary * 0.18) {
    errors.push({
      field: 'rrspContribution',
      message: 'RRSP contribution may exceed 18% of earned income',
      severity: 'warning',
      code: 'RRSP_PERCENTAGE_LIMIT'
    });
  }
  
  // Spouse and dependents validations
  if (input.spouseAmount && input.maritalStatus === 'single') {
    errors.push({
      field: 'spouseAmount',
      message: 'Cannot claim spouse amount if marital status is single',
      severity: 'error',
      code: 'SPOUSE_STATUS_MISMATCH'
    });
  }
  
  if (input.spouseIncome < 0) {
    errors.push({
      field: 'spouseIncome',
      message: 'Spouse income cannot be negative',
      severity: 'error',
      code: 'NEGATIVE_SPOUSE_INCOME'
    });
  }
  
  if (input.dependentChildren < 0 || input.childrenOver18 < 0) {
    errors.push({
      field: 'dependentChildren',
      message: 'Number of dependent children cannot be negative',
      severity: 'error',
      code: 'NEGATIVE_DEPENDENTS'
    });
  }
  
  // Medical expenses validation
  const netIncomeEstimate = input.salary + input.otherIncome + input.pensionIncome;
  const medicalThreshold = Math.min(2759, netIncomeEstimate * 0.03); // 2024 medical expense threshold
  
  if (input.medicalExpenses > 0 && input.medicalExpenses < medicalThreshold) {
    errors.push({
      field: 'medicalExpenses',
      message: `Medical expenses below threshold of $${medicalThreshold.toFixed(0)} may not provide tax benefit`,
      severity: 'info',
      code: 'MEDICAL_THRESHOLD'
    });
  }
  
  // Charitable donations validation
  if (input.charitableDonations > netIncomeEstimate * 0.75) {
    errors.push({
      field: 'charitableDonations',
      message: 'Charitable donations exceed 75% of net income limit',
      severity: 'warning',
      code: 'CHARITABLE_LIMIT'
    });
  }
  
  // Residency validations
  if (!input.isResident && input.salary > 0) {
    errors.push({
      field: 'isResident',
      message: 'Non-residents with Canadian employment income require special calculations',
      severity: 'warning',
      code: 'NON_RESIDENT_EMPLOYMENT'
    });
  }
  
  // Date validations
  if (input.immigrationDate) {
    const immigrationDate = new Date(input.immigrationDate);
    const currentYear = new Date().getFullYear();
    if (immigrationDate.getFullYear() === currentYear) {
      errors.push({
        field: 'immigrationDate',
        message: 'Part-year residence may affect tax calculations and credits',
        severity: 'info',
        code: 'PART_YEAR_RESIDENT'
      });
    }
  }
  
  return errors;
}

// Enhanced tax calculation functions
function calculateTaxOnIncome(income: number, brackets: TaxBracket[]): number {
  let tax = 0;
  
  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    
    const taxableInThisBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInThisBracket * bracket.rate;
  }
  
  return tax;
}

function calculateMarginalTaxRate(income: number, brackets: TaxBracket[]): number {
  for (const bracket of brackets) {
    if (income > bracket.min && income <= bracket.max) {
      return bracket.rate;
    }
  }
  return brackets[brackets.length - 1]?.rate || 0;
}

function calculateBasicPersonalAmount(province: string, age: number): number {
  // 2024 federal basic personal amount
  const federalBPA = 15705;
  
  // Provincial basic personal amounts (2024)
  const provincialBPA: Record<string, number> = {
    'QC': 18056,
    'ON': 12399,
    'BC': 11980,
    'AB': 21003,
    'SK': 17661,
    'MB': 15780,
    'NB': 12458,
    'NS': 8744,
    'PE': 12500,
    'NL': 10382,
    'NT': 16593,
    'NU': 18767,
    'YT': 15705
  };
  
  // Age credit eligibility (65+)
  const ageAmount = age >= 65 ? 8790 : 0; // 2024 federal age amount
  
  return federalBPA + (provincialBPA[province] || 0) + ageAmount;
}

function calculateEmploymentCredit(employmentIncome: number): number {
  // Federal employment amount: lesser of $1,368 or 3% of employment income
  return Math.min(1368, employmentIncome * 0.03);
}

function calculateCPPEICredit(cppContribs: number, eiPremiums: number): number {
  // 2024 maximum CPP contribution: $4,055.25
  // 2024 maximum EI premium: $1,049.12
  const maxCPP = 4055.25;
  const maxEI = 1049.12;
  
  const validCPP = Math.min(cppContribs, maxCPP);
  const validEI = Math.min(eiPremiums, maxEI);
  
  return validCPP + validEI;
}

function calculateDividendTax(eligibleDiv: number, nonEligibleDiv: number, province: string): { grossUp: number; taxCredit: number } {
  // Eligible dividend gross-up and tax credit (2024)
  const eligibleGrossUp = eligibleDiv * 0.38; // 38% gross-up
  const eligibleFedCredit = eligibleDiv * 0.25; // 25% federal credit
  
  // Non-eligible dividend gross-up and tax credit (2024)
  const nonEligibleGrossUp = nonEligibleDiv * 0.15; // 15% gross-up
  const nonEligibleFedCredit = nonEligibleDiv * 0.0903; // 9.03% federal credit
  
  // Provincial dividend tax credits vary by province
  const provincialRates: Record<string, { eligible: number; nonEligible: number }> = {
    'QC': { eligible: 0.1196, nonEligible: 0.0496 },
    'ON': { eligible: 0.10, nonEligible: 0.0325 },
    'BC': { eligible: 0.12, nonEligible: 0.0270 },
    'AB': { eligible: 0.10, nonEligible: 0.0278 },
    // Add other provinces as needed
  };
  
  const provRates = provincialRates[province] || { eligible: 0.10, nonEligible: 0.03 };
  
  const eligibleProvCredit = eligibleDiv * provRates.eligible;
  const nonEligibleProvCredit = nonEligibleDiv * provRates.nonEligible;
  
  return {
    grossUp: eligibleGrossUp + nonEligibleGrossUp,
    taxCredit: eligibleFedCredit + nonEligibleFedCredit + eligibleProvCredit + nonEligibleProvCredit
  };
}

function calculateAMT(input: TaxInput, regularTax: number): { amtTax: number; amtCarryforward: number } {
  if (!input.alternativeMinimumTax) {
    return { amtTax: 0, amtCarryforward: 0 };
  }
  
  // AMT calculation (simplified)
  const totalIncome = input.salary + input.eligibleDiv + input.nonEligibleDiv + 
                     input.otherIncome + (input.capitalGains * 1.0); // 100% inclusion for AMT
  
  const amtExemption = 173000; // 2024 AMT exemption
  const amtRate = 0.205; // 20.5% AMT rate
  
  const amtBase = Math.max(0, totalIncome - amtExemption);
  const calculatedAMT = amtBase * amtRate;
  
  const amtPayable = Math.max(0, calculatedAMT - regularTax);
  
  return {
    amtTax: amtPayable,
    amtCarryforward: Math.max(0, input.previousYearMinimumTax - (regularTax - calculatedAMT))
  };
}

export function calcIndTax(input: TaxInput): TaxOutput {
  const validationErrors = validateTaxInput(input);
  const warnings: string[] = [];
  const optimizations: string[] = [];
  
  // Basic income calculations
  const dividendCalc = calculateDividendTax(input.eligibleDiv || 0, input.nonEligibleDiv || 0, input.province);
  
  const totalIncome = (input.salary || 0) + 
                     (input.eligibleDiv || 0) + 
                     (input.nonEligibleDiv || 0) + 
                     dividendCalc.grossUp +
                     (input.otherIncome || 0) + 
                     (input.capitalGains || 0) * 0.5 + // 50% taxable capital gains
                     (input.foreignIncome || 0) +
                     (input.rentalIncome || 0) +
                     (input.businessIncome || 0) +
                     (input.pensionIncome || 0);
  
  // Calculate deductions
  const totalDeductions = (input.rrspContribution || 0) +
                         (input.cppExcessContribution || 0) +
                         (input.employmentInsuranceExcess || 0) +
                         (input.carryingCharges || 0) +
                         (input.supportPayments || 0) +
                         (input.movingExpenses || 0) +
                         (input.childCareExpenses || 0);
  
  const netIncome = Math.max(0, totalIncome - totalDeductions);
  const taxableIncome = netIncome; // Simplified, would normally include additional deductions
  
  if (taxableIncome <= 0) {
    return {
      netTax: 0,
      marginalRate: 0,
      effectiveRate: 0,
      breakdown: {} as TaxCalculationBreakdown,
      validationErrors,
      warnings: ['No taxable income'],
      optimizations: []
    };
  }
  
  // Calculate federal and provincial tax
  const fedTax = calculateTaxOnIncome(taxableIncome, rates.fed);
  const qcTax = calculateTaxOnIncome(taxableIncome, rates.qc);
  const totalTaxBeforeCredits = fedTax + qcTax;
  
  // Calculate tax credits
  const basicPersonalAmount = calculateBasicPersonalAmount(input.province, input.age);
  const employmentCredit = calculateEmploymentCredit(input.salary || 0);
  const cppEiCredit = calculateCPPEICredit(input.cppContributions || 0, input.employmentInsurancePremiums || 0);
  
  // Spouse credit calculation
  const spouseThreshold = 15705; // 2024 federal spouse amount
  const spouseCredit = input.spouseAmount && input.spouseIncome < spouseThreshold 
    ? Math.max(0, spouseThreshold - (input.spouseIncome || 0)) 
    : 0;
  
  // Medical expense credit (3% of net income threshold)
  const medicalThreshold = Math.min(2759, netIncome * 0.03);
  const medicalCredit = Math.max(0, (input.medicalExpenses || 0) - medicalThreshold) * 0.15;
  
  // Charitable donations credit (15% first $200, then 29%)
  const charitableCredit = input.charitableDonations 
    ? Math.min(200, input.charitableDonations) * 0.15 + 
      Math.max(0, input.charitableDonations - 200) * 0.29
    : 0;
  
  const totalNonRefundableCredits = basicPersonalAmount * 0.15 + // 15% federal rate
                                   employmentCredit * 0.15 +
                                   cppEiCredit * 0.15 +
                                   spouseCredit * 0.15 +
                                   medicalCredit +
                                   charitableCredit +
                                   dividendCalc.taxCredit +
                                   (input.tuitionFees || 0) * 0.15 +
                                   (input.disability ? 9428 * 0.15 : 0); // 2024 disability amount
  
  // Calculate final tax
  const federalTaxAfterCredits = Math.max(0, fedTax - totalNonRefundableCredits);
  const provincialTaxAfterCredits = Math.max(0, qcTax - (totalNonRefundableCredits * 0.5)); // Simplified provincial credit
  
  const totalTax = federalTaxAfterCredits + provincialTaxAfterCredits;
  
  // AMT calculation
  const amtResult = calculateAMT(input, totalTax);
  const finalTax = Math.max(totalTax, amtResult.amtTax);
  
  // Calculate rates
  const marginalFedRate = calculateMarginalTaxRate(taxableIncome, rates.fed);
  const marginalQcRate = calculateMarginalTaxRate(taxableIncome, rates.qc);
  const marginalRate = (marginalFedRate + marginalQcRate) * 100;
  const effectiveRate = totalIncome > 0 ? (finalTax / totalIncome) * 100 : 0;
  
  // Generate optimization suggestions
  if (input.rrspContribution < Math.min(31560, input.salary * 0.18)) {
    optimizations.push('Consider maximizing RRSP contribution for additional tax savings');
  }
  
  if (input.medicalExpenses > medicalThreshold && input.medicalExpenses < 5000) {
    optimizations.push('Consider timing medical expenses to exceed threshold in single year');
  }
  
  if (input.charitableDonations > 0 && input.charitableDonations < 200) {
    optimizations.push('Consider increasing charitable donations above $200 for higher tax credit rate');
  }
  
  const breakdown: TaxCalculationBreakdown = {
    totalIncome,
    netIncome,
    taxableIncome,
    federalTaxBeforeCredits: fedTax,
    provincialTaxBeforeCredits: qcTax,
    totalTaxBeforeCredits,
    basicPersonalAmount,
    spouseCredit,
    dependentCredit: 0, // Would calculate based on dependents
    ageCredit: input.age >= 65 ? 8790 * 0.15 : 0,
    pensionCredit: Math.min(2000, input.pensionIncome || 0) * 0.15,
    disabilityCredit: input.disability ? 9428 * 0.15 : 0,
    tuitionCredit: (input.tuitionFees || 0) * 0.15,
    medicalCredit,
    charitableCredit,
    employmentCredit: employmentCredit * 0.15,
    cppEiCredit: cppEiCredit * 0.15,
    totalNonRefundableCredits,
    childBenefit: 0, // Would calculate based on family income and children
    gstCredit: 0, // Would calculate based on income and family size
    workingIncomeCredit: 0, // Would calculate based on working income
    totalRefundableCredits: 0,
    federalTax: federalTaxAfterCredits,
    provincialTax: provincialTaxAfterCredits,
    totalTax,
    marginalTaxRate: marginalRate,
    averageeTaxRate: effectiveRate,
    amtAdjustedTaxableIncome: totalIncome,
    amtTax: amtResult.amtTax,
    amtCarryforward: amtResult.amtCarryforward,
    netTaxOwed: Math.max(0, finalTax),
    refundDue: Math.max(0, -finalTax)
  };
  
  return {
    netTax: Math.round(finalTax * 100) / 100,
    marginalRate: Math.round(marginalRate * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    breakdown,
    validationErrors,
    warnings,
    optimizations
  };
} 