// Alternative Minimum Tax Calculator (2024+ Reforms)
// Comprehensive implementation with enhanced exemption, increased rate, and detailed analysis

export interface AMTInputs {
  taxYear: number;
  province: 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  filingStatus: 'individual' | 'married' | 'trust';
  totalIncome: number;
  netIncome: number;
  taxableIncome: number;
  regularFederalTax: number;
  capitalGains: number;
  capitalGainsDeductions: number;
  stockOptionBenefits: number;
  stockOptionDeductions: number;
  cca: number;
  resourceAllowances: number;
  depletionAllowances: number;
  flowThroughDeductions: number;
  limitedPartnershipLosses: number;
  charitableDonations: number;
  politicalContributions: number;
  medicalExpenses: number;
  basicPersonalAmount: number;
  spouseCredit: number;
  dependentCredits: number;
  ageCredit: number;
  pensionCredit: number;
  disabilityCredit: number;
  tuitionCredits: number;
  dividendTaxCredits: number;
  foreignTaxCredits: number;
  trusts: {
    designatedIncome: number;
    preferredBeneficiary: boolean;
    multipleGenerationSkip: boolean;
  };
  professionalCorporation: boolean;
  passiveInvestmentIncome: number;
  foreignSourceIncome: number;
  treatyCountry: string;
  priorYearAMT: number[];
  priorYearRegularTax: number[];
  amtCreditCarryforward: number;
}

export interface AMTOutput {
  // STEP 1: AMT EXEMPTION DETERMINATION
  amtExemption: {
    baseExemption: number;
    indexationFactor: number;
    currentYearExemption: number;
    phaseOutThreshold: number;
    phaseOutReduction: number;
    finalExemption: number;
    exemptionNotes: string[];
  };
  
  // STEP 2: ENHANCED AMT ADJUSTMENTS (2024+ REFORMS)
  amtAdjustments: {
    capitalGainsIncrease: number;
    stockOptionLimitation: number;
    ccaAddback: number;
    resourceDepletion: number;
    flowThroughAdjustment: number;
    limitedPartnershipLoss: number;
    passiveInvestmentAdjustment: number;
    trustDesignatedIncome: number;
    professionalCorpAdjustment: number;
    totalAdjustments: number;
    adjustmentBreakdown: Array<{
      description: string;
      amount: number;
      calculation: string;
      reform2024Impact: boolean;
    }>;
  };
  
  // STEP 3: ADJUSTED TAXABLE INCOME
  adjustedTaxableIncome: {
    regularTaxableIncome: number;
    plusAdjustments: number;
    adjustedTaxableIncome: number;
    lessExemption: number;
    amtBase: number;
    calculationSummary: string[];
  };
  
  // STEP 4: TENTATIVE MINIMUM TAX CALCULATION
  tentativeMinimumTax: {
    amtBase: number;
    amtRate: number; // 20.5% for 2024+
    tentativeAMT: number;
    rateIncrease2024: string;
    calculationSteps: string[];
  };
  
  // STEP 5: ALLOWABLE CREDITS UNDER AMT
  allowableCredits: {
    basicPersonalCredit: number;
    spouseCredit: number;
    dependentCredits: number;
    ageCredit: number;
    pensionCredit: number;
    disabilityCredit: number;
    tuitionCredits: number;
    medicalExpenseCredit: number;
    charitableDonationCredit: {
      totalDonations: number;
      limitUnderAMT: number; // 50% cap
      allowableCredit: number;
      excessCarriedForward: number;
    };
    politicalContributionCredit: number;
    foreignTaxCredits: {
      regularAmount: number;
      amtLimitation: number;
      allowableAmount: number;
    };
    totalAllowableCredits: number;
    creditLimitations: Array<{
      creditType: string;
      regularAmount: number;
      amtLimitation: number;
      difference: number;
    }>;
  };
  
  // STEP 6: FINAL AMT CALCULATION
  finalAMT: {
    tentativeMinimumTax: number;
    lessAllowableCredits: number;
    finalAMT: number;
    regularFederalTax: number;
    amtPayable: number;
    isAMTApplicable: boolean;
    calculationSummary: string[];
  };
  
  // STEP 7: AMT CREDIT ANALYSIS (7-YEAR CARRYFORWARD)
  amtCreditAnalysis: {
    currentYearCredit: number;
    priorYearCredits: Array<{
      year: number;
      creditGenerated: number;
      creditUsed: number;
      creditRemaining: number;
      yearsRemaining: number;
    }>;
    totalCreditsAvailable: number;
    currentYearUtilization: number;
    creditsCarriedForward: number;
    expiringCredits: Array<{
      year: number;
      amount: number;
      expiryYear: number;
    }>;
  };
  
  // STEP 8: TAX PLANNING ANALYSIS
  taxPlanningAnalysis: {
    amtTriggers: Array<{
      trigger: string;
      impact: number;
      mitigation: string;
      priority: 'High' | 'Medium' | 'Low';
    }>;
    optimizationOpportunities: Array<{
      strategy: string;
      potentialSavings: number;
      implementation: string;
      timing: string;
    }>;
    capitalGainsPlanning: {
      currentInclusion: number;
      amtInclusion: number;
      additionalTax: number;
      realizationTiming: string;
    };
    stockOptionPlanning: {
      currentDeduction: number;
      amtDeduction: number;
      additionalTax: number;
      exerciseTiming: string;
    };
  };
  
  // STEP 9: COMPLIANCE REQUIREMENTS
  complianceRequirements: {
    form691Required: boolean;
    schedule12Required: boolean;
    filingDeadline: string;
    penaltyRisk: {
      lateFilingPenalty: number;
      interestCharges: number;
      grossNegligencePenalty: number;
      voluntaryDisclosureEligible: boolean;
    };
    recordKeeping: string[];
    professionalAdviceRecommended: boolean;
  };
  
  // STEP 10: MULTI-YEAR PROJECTIONS
  multiYearProjections: Array<{
    year: number;
    projectedIncome: number;
    projectedAMT: number;
    projectedCredits: number;
    netAMTLiability: number;
    cumulativeCredits: number;
    planningNotes: string[];
  }>;
  
  // STEP 11: SUMMARY METRICS & RECOMMENDATIONS
  summaryMetrics: {
    effectiveAMTRate: number;
    marginalAMTRate: number;
    amtAsPercentOfIncome: number;
    creditUtilizationRate: number;
    yearsToUtilizeCredits: number;
    totalLifetimeAMTImpact: number;
    keyMetrics: Array<{
      metric: string;
      value: number | string;
      benchmark: string;
      interpretation: string;
    }>;
  };
  
  // DETAILED BREAKDOWN FOR PROFESSIONALS
  professionalBreakdown: {
    step1_exemptionCalculation: any;
    step2_adjustmentDetails: any;
    step3_incomeCalculation: any;
    step4_tentativeTaxCalculation: any;
    step5_creditLimitations: any;
    step6_finalCalculation: any;
    step7_creditAnalysis: any;
    step8_planningAnalysis: any;
    step9_complianceCheck: any;
    step10_projections: any;
    step11_recommendations: any;
  };
}

export function calcAMT(input: AMTInputs): AMTOutput {
  // CONSTANTS FOR 2024+ REFORMS
  const AMT_RATE_2024 = 0.205; // Increased from 15% to 20.5%
  const BASE_EXEMPTION_2024 = 173205; // Enhanced exemption
  const EXEMPTION_PHASE_OUT = 165000;
  const CHARITABLE_DONATION_LIMIT = 0.50; // 50% cap under AMT
  const STOCK_OPTION_LIMIT = 0.30; // Limited to 30% deduction
  
  // STEP 1: AMT EXEMPTION DETERMINATION
  const indexationFactor = (input.taxYear || 2024) >= 2024 ? 1.0 : 0.95;
  const currentYearExemption = Math.round(BASE_EXEMPTION_2024 * indexationFactor);
  const phaseOutReduction = Math.max(0, ((input.netIncome || 0) - EXEMPTION_PHASE_OUT) * 0.25);
  const finalExemption = Math.max(0, currentYearExemption - phaseOutReduction);
  
  const amtExemption = {
    baseExemption: BASE_EXEMPTION_2024,
    indexationFactor,
    currentYearExemption,
    phaseOutThreshold: EXEMPTION_PHASE_OUT,
    phaseOutReduction,
    finalExemption,
    exemptionNotes: [
      `2024+ Reform: Enhanced exemption increased from $40,000 to $173,205`,
      `Indexed annually based on inflation (${((indexationFactor - 1) * 100).toFixed(1)}% for ${input.taxYear || 2024})`,
      phaseOutReduction > 0 ? `Exemption reduced by 25% of income over $165,000` : 'No phase-out reduction applicable'
    ]
  };
  
  // STEP 2: ENHANCED AMT ADJUSTMENTS (2024+ REFORMS)
  const capitalGainsIncrease = (input.capitalGains || 0) * 0.5; // 100% vs 50% inclusion
  const stockOptionLimitation = (input.stockOptionBenefits || 0) * (0.5 - STOCK_OPTION_LIMIT); // Limited to 30%
  const ccaAddback = input.cca || 0;
  const resourceDepletion = (input.resourceAllowances || 0) + (input.depletionAllowances || 0);
  const flowThroughAdjustment = (input.flowThroughDeductions || 0) * 0.65;
  const limitedPartnershipLoss = input.limitedPartnershipLosses || 0;
  const passiveInvestmentAdjustment = (input.passiveInvestmentIncome || 0) * 0.3;
  const trustDesignatedIncome = (input.trusts?.designatedIncome || 0) * 0.25;
  const professionalCorpAdjustment = input.professionalCorporation ? (input.netIncome || 0) * 0.05 : 0;
  
  const totalAdjustments = capitalGainsIncrease + stockOptionLimitation + ccaAddback + 
                          resourceDepletion + flowThroughAdjustment + limitedPartnershipLoss +
                          passiveInvestmentAdjustment + trustDesignatedIncome + professionalCorpAdjustment;
  
  const adjustmentBreakdown = [
    {
      description: "Capital Gains - Additional 50% Inclusion",
      amount: capitalGainsIncrease,
      calculation: `$${(input.capitalGains || 0).toLocaleString()} × 50%`,
      reform2024Impact: true
    },
    {
      description: "Stock Options - Deduction Limitation (30% max)",
      amount: stockOptionLimitation,
      calculation: `$${(input.stockOptionBenefits || 0).toLocaleString()} × (50% - 30%)`,
      reform2024Impact: true
    },
    {
      description: "Capital Cost Allowance Add-back",
      amount: ccaAddback,
      calculation: `Full CCA amount: $${ccaAddback.toLocaleString()}`,
      reform2024Impact: false
    },
    {
      description: "Resource/Depletion Allowances",
      amount: resourceDepletion,
      calculation: `$${resourceDepletion.toLocaleString()}`,
      reform2024Impact: false
    },
    {
      description: "Flow-Through Share Deductions (65%)",
      amount: flowThroughAdjustment,
      calculation: `$${(input.flowThroughDeductions || 0).toLocaleString()} × 65%`,
      reform2024Impact: false
    }
  ].filter(adj => adj.amount > 0);
  
  const amtAdjustments = {
    capitalGainsIncrease,
    stockOptionLimitation,
    ccaAddback,
    resourceDepletion,
    flowThroughAdjustment,
    limitedPartnershipLoss,
    passiveInvestmentAdjustment,
    trustDesignatedIncome,
    professionalCorpAdjustment,
    totalAdjustments,
    adjustmentBreakdown
  };
  
  // STEP 3: ADJUSTED TAXABLE INCOME
  const adjustedTaxableIncome = (input.taxableIncome || 0) + totalAdjustments;
  const amtBase = Math.max(0, adjustedTaxableIncome - finalExemption);
  
  const step3 = {
    regularTaxableIncome: input.taxableIncome || 0,
    plusAdjustments: totalAdjustments,
    adjustedTaxableIncome,
    lessExemption: finalExemption,
    amtBase,
    calculationSummary: [
      `Regular Taxable Income: $${(input.taxableIncome || 0).toLocaleString()}`,
      `Plus AMT Adjustments: $${totalAdjustments.toLocaleString()}`,
      `Adjusted Taxable Income: $${adjustedTaxableIncome.toLocaleString()}`,
      `Less AMT Exemption: $${finalExemption.toLocaleString()}`,
      `AMT Base: $${amtBase.toLocaleString()}`
    ]
  };
  
  // STEP 4: TENTATIVE MINIMUM TAX CALCULATION
  const tentativeAMT = amtBase * AMT_RATE_2024;
  
  const step4 = {
    amtBase,
    amtRate: AMT_RATE_2024,
    tentativeAMT,
    rateIncrease2024: `Rate increased from 15% to 20.5% under 2024 reforms`,
    calculationSteps: [
      `AMT Base: $${amtBase.toLocaleString()}`,
      `AMT Rate: ${(AMT_RATE_2024 * 100)}% (2024+ Reform)`,
      `Tentative Minimum Tax: $${tentativeAMT.toLocaleString()}`
    ]
  };
  
  // STEP 5: ALLOWABLE CREDITS UNDER AMT
  const basicPersonalCredit = (input.basicPersonalAmount || 0) * 0.15;
  const spouseCredit = input.spouseCredit || 0;
  const dependentCredits = input.dependentCredits || 0;
  const ageCredit = input.ageCredit || 0;
  const pensionCredit = input.pensionCredit || 0;
  const disabilityCredit = input.disabilityCredit || 0;
  const tuitionCredits = input.tuitionCredits || 0;
  const medicalExpenseCredit = Math.max(0, ((input.medicalExpenses || 0) - (input.netIncome || 0) * 0.03)) * 0.15;
  
  // Charitable donations limited to 50% under AMT
  const charitableDonationLimit = (input.charitableDonations || 0) * CHARITABLE_DONATION_LIMIT;
  const charitableDonationCredit = charitableDonationLimit * 0.29; // Using top rate
  const excessCharitableCarriedForward = (input.charitableDonations || 0) - charitableDonationLimit;
  
  const foreignTaxCreditsAMT = Math.min((input.foreignTaxCredits || 0), tentativeAMT * 0.15);
  
  const totalAllowableCredits = basicPersonalCredit + spouseCredit + dependentCredits + 
                               ageCredit + pensionCredit + disabilityCredit + tuitionCredits +
                               medicalExpenseCredit + charitableDonationCredit + foreignTaxCreditsAMT;
  
  const creditLimitations = [
    {
      creditType: "Charitable Donations",
      regularAmount: (input.charitableDonations || 0) * 0.29,
      amtLimitation: charitableDonationCredit,
      difference: ((input.charitableDonations || 0) * 0.29) - charitableDonationCredit
    },
    {
      creditType: "Foreign Tax Credits",
      regularAmount: input.foreignTaxCredits || 0,
      amtLimitation: foreignTaxCreditsAMT,
      difference: (input.foreignTaxCredits || 0) - foreignTaxCreditsAMT
    }
  ].filter(limit => limit.difference > 0);
  
  const allowableCredits = {
    basicPersonalCredit,
    spouseCredit,
    dependentCredits,
    ageCredit,
    pensionCredit,
    disabilityCredit,
    tuitionCredits,
    medicalExpenseCredit,
    charitableDonationCredit: {
      totalDonations: input.charitableDonations || 0,
      limitUnderAMT: charitableDonationLimit,
      allowableCredit: charitableDonationCredit,
      excessCarriedForward: excessCharitableCarriedForward
    },
    politicalContributionCredit: (input.politicalContributions || 0) * 0.75,
    foreignTaxCredits: {
      regularAmount: input.foreignTaxCredits || 0,
      amtLimitation: foreignTaxCreditsAMT,
      allowableAmount: foreignTaxCreditsAMT
    },
    totalAllowableCredits,
    creditLimitations
  };
  
  // STEP 6: FINAL AMT CALCULATION
  const finalAMTAmount = Math.max(0, tentativeAMT - totalAllowableCredits);
  const amtPayable = Math.max(0, finalAMTAmount - (input.regularFederalTax || 0));
  const isAMTApplicable = amtPayable > 0;
  
  const finalAMT = {
    tentativeMinimumTax: tentativeAMT,
    lessAllowableCredits: totalAllowableCredits,
    finalAMT: finalAMTAmount,
    regularFederalTax: input.regularFederalTax || 0,
    amtPayable,
    isAMTApplicable,
    calculationSummary: [
      `Tentative Minimum Tax: $${tentativeAMT.toLocaleString()}`,
      `Less Allowable Credits: $${totalAllowableCredits.toLocaleString()}`,
      `Final AMT: $${finalAMTAmount.toLocaleString()}`,
      `Regular Federal Tax: $${(input.regularFederalTax || 0).toLocaleString()}`,
      `AMT Payable: $${amtPayable.toLocaleString()}`,
      isAMTApplicable ? 'AMT APPLIES - Additional tax payable' : 'AMT does not apply'
    ]
  };
  
  // STEP 7: AMT CREDIT ANALYSIS
  const currentYearCredit = isAMTApplicable ? amtPayable : 0;
  const totalCreditsAvailable = (input.amtCreditCarryforward || 0) + currentYearCredit;
  
  const amtCreditAnalysis = {
    currentYearCredit,
    priorYearCredits: (input.priorYearAMT || []).map((amt, index) => ({
      year: (input.taxYear || 2024) - (input.priorYearAMT || []).length + index,
      creditGenerated: amt,
      creditUsed: 0, // Simplified - would need complex carryforward logic
      creditRemaining: amt,
      yearsRemaining: 7 - index
    })),
    totalCreditsAvailable,
    currentYearUtilization: 0,
    creditsCarriedForward: totalCreditsAvailable,
    expiringCredits: []
  };
  
  // STEP 8: TAX PLANNING ANALYSIS
  const amtTriggers = [
    {
      trigger: "Large Capital Gains Realization",
      impact: capitalGainsIncrease * AMT_RATE_2024,
      mitigation: "Consider spreading realization over multiple years",
      priority: 'High' as const
    },
    {
      trigger: "Stock Option Exercise",
      impact: stockOptionLimitation * AMT_RATE_2024,
      mitigation: "Time exercise to minimize AMT impact",
      priority: 'High' as const
    },
    {
      trigger: "High Charitable Donations",
      impact: excessCharitableCarriedForward * 0.29,
      mitigation: "Spread donations over multiple years for full benefit",
      priority: 'Medium' as const
    }
  ].filter(trigger => trigger.impact > 1000);
  
  const optimizationOpportunities = [
    {
      strategy: "Income Smoothing",
      potentialSavings: amtPayable * 0.3,
      implementation: "Defer income or accelerate deductions",
      timing: "Before year-end"
    },
    {
      strategy: "AMT Credit Utilization",
      potentialSavings: totalCreditsAvailable * 0.8,
      implementation: "Plan future years to utilize AMT credits",
      timing: "Multi-year planning"
    }
  ];
  
  const taxPlanningAnalysis = {
    amtTriggers,
    optimizationOpportunities,
    capitalGainsPlanning: {
      currentInclusion: (input.capitalGains || 0) * 0.5,
      amtInclusion: input.capitalGains || 0,
      additionalTax: capitalGainsIncrease * AMT_RATE_2024,
      realizationTiming: "Consider multi-year realization strategy"
    },
    stockOptionPlanning: {
      currentDeduction: (input.stockOptionBenefits || 0) * 0.5,
      amtDeduction: (input.stockOptionBenefits || 0) * STOCK_OPTION_LIMIT,
      additionalTax: stockOptionLimitation * AMT_RATE_2024,
      exerciseTiming: "Time exercise to minimize AMT exposure"
    }
  };
  
  // STEP 9: COMPLIANCE REQUIREMENTS
  const complianceRequirements = {
    form691Required: isAMTApplicable || totalCreditsAvailable > 0,
    schedule12Required: isAMTApplicable,
    filingDeadline: `April 30, ${(input.taxYear || 2024) + 1}`,
    penaltyRisk: {
      lateFilingPenalty: isAMTApplicable ? amtPayable * 0.05 : 0,
      interestCharges: amtPayable * 0.08, // Simplified annual rate
      grossNegligencePenalty: amtPayable * 0.50,
      voluntaryDisclosureEligible: true
    },
    recordKeeping: [
      "Form T691 - Alternative Minimum Tax",
      "Schedule 12 - Alternative Minimum Tax",
      "Supporting documentation for all adjustments",
      "Capital gains/losses schedules",
      "Stock option benefit calculations"
    ],
    professionalAdviceRecommended: amtPayable > 5000 || totalAdjustments > 50000
  };
  
  // STEP 10: MULTI-YEAR PROJECTIONS
  const multiYearProjections = Array.from({length: 5}, (_, i) => {
    const projectionYear = (input.taxYear || 2024) + i + 1;
    const projectedIncome = (input.netIncome || 0) * Math.pow(1.03, i + 1); // 3% growth
    const projectedAMT = projectedIncome > 200000 ? amtPayable * 0.8 : 0; // Simplified
    
    return {
      year: projectionYear,
      projectedIncome,
      projectedAMT,
      projectedCredits: totalCreditsAvailable * Math.pow(0.8, i),
      netAMTLiability: Math.max(0, projectedAMT - (totalCreditsAvailable * Math.pow(0.8, i))),
      cumulativeCredits: totalCreditsAvailable * Math.pow(0.9, i),
      planningNotes: [
        `Projected income growth: 3% annually`,
        projectedAMT > 0 ? 'AMT likely to apply' : 'AMT unlikely',
        `Credit utilization opportunity: $${(totalCreditsAvailable * Math.pow(0.8, i)).toLocaleString()}`
      ]
    };
  });
  
  // STEP 11: SUMMARY METRICS & RECOMMENDATIONS
  const effectiveAMTRate = (input.netIncome || 0) > 0 ? (amtPayable / (input.netIncome || 1)) * 100 : 0;
  const marginalAMTRate = AMT_RATE_2024 * 100;
  const amtAsPercentOfIncome = effectiveAMTRate;
  const creditUtilizationRate = totalCreditsAvailable > 0 ? 0 : 100;
  const yearsToUtilizeCredits = totalCreditsAvailable > 0 ? Math.ceil(totalCreditsAvailable / Math.max(1, (input.regularFederalTax || 0) * 0.1)) : 0;
  
  const summaryMetrics = {
    effectiveAMTRate,
    marginalAMTRate,
    amtAsPercentOfIncome,
    creditUtilizationRate,
    yearsToUtilizeCredits,
    totalLifetimeAMTImpact: amtPayable + (totalCreditsAvailable * 0.7),
    keyMetrics: [
      {
        metric: "AMT Liability",
        value: `$${amtPayable.toLocaleString()}`,
        benchmark: "0% of high-net-worth individuals",
        interpretation: amtPayable > 0 ? "AMT applies - planning required" : "No AMT liability"
      },
      {
        metric: "Effective AMT Rate",
        value: `${effectiveAMTRate.toFixed(2)}%`,
        benchmark: "1-3% typical range",
        interpretation: effectiveAMTRate > 3 ? "High AMT burden" : "Reasonable AMT impact"
      },
      {
        metric: "Credit Carryforward",
        value: `$${totalCreditsAvailable.toLocaleString()}`,
        benchmark: "7-year utilization period",
        interpretation: totalCreditsAvailable > 0 ? "Planning opportunity" : "No credits available"
      }
    ]
  };
  
  return {
    amtExemption,
    amtAdjustments,
    adjustedTaxableIncome: step3,
    tentativeMinimumTax: step4,
    allowableCredits,
    finalAMT,
    amtCreditAnalysis,
    taxPlanningAnalysis,
    complianceRequirements,
    multiYearProjections,
    summaryMetrics,
    professionalBreakdown: {
      step1_exemptionCalculation: amtExemption,
      step2_adjustmentDetails: amtAdjustments,
      step3_incomeCalculation: step3,
      step4_tentativeTaxCalculation: step4,
      step5_creditLimitations: allowableCredits,
      step6_finalCalculation: finalAMT,
      step7_creditAnalysis: amtCreditAnalysis,
      step8_planningAnalysis: taxPlanningAnalysis,
      step9_complianceCheck: complianceRequirements,
      step10_projections: multiYearProjections,
      step11_recommendations: summaryMetrics
    }
  };
} 