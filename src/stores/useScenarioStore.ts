import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calcIndTax } from '@/calculators/indTax';
import { calcCorpTax } from '@/calculators/corpTax';
import { calcCorpCapGain } from '@/calculators/corpCapGain';
import { calcDeathTax } from '@/calculators/deathTax';
import { calcRollover85 } from '@/calculators/rollover85';
import { calcDepartureTax } from '@/calculators/departureTax';
import { calcAMT } from '@/calculators/amt';
import { calcWindup88 } from '@/calculators/windup88';

export type CalculatorType = 
  | 'indTax'
  | 'corpTax'
  | 'corpCapGain'
  | 'deathTax' 
  | 'rollover85'
  | 'departureTax'
  | 'amt'
  | 'windup88';

// Individual Tax inputs
interface IndTaxInputs {
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
  immigrationDate: string;
  emigrationDate: string;
  
  // Special situations
  fishingCredits: number;
  farmingIncome: number;
  artistCredits: number;
  workersSafetyInsurance: number;
  employmentInsuranceBenefits: number;
  socialAssistance: number;
  
  notes: string;
}

// Corporate Tax inputs
interface CorpTaxInputs {
  abi: number;
  sbdEligibility: number;
  refundableTaxes: number;
  rdtohBalance: number;
}

// Corporate Capital Gain inputs
interface CorpCapGainInputs {
  proceeds: number;
  acb: number;
  safeIncomeBump: number;
  vDay: number;
  cdaBalance: number;
  outlaysExpenses: number;
  reserve: number;
}

// Death Tax inputs
interface DeathTaxInputs {
  dateOfDeath: string;
  fmvAtDeath: number;
  acb: number;
  ucc: number;
  propertyType: 'capital' | 'depreciable' | 'eligible_capital' | 'inventory' | 'rrsp_rrif' | 'tfsa' | 'principal_residence';
  principalResidenceYears: number;
  totalOwnershipYears: number;
  isQualifiedFarmProperty: boolean;
  isQualifiedFishingProperty: boolean;
  isQualifiedSmallBusinessShares: boolean;
  usedLifetimeCapitalGainsExemption: number;
  charitableDonationElection: boolean;
  deferralToSpouse: boolean;
  spouseRolloverElection: boolean;
  alternativeMinimumTax: boolean;
  netCapitalLossCarryforward: number;
  willExists: boolean;
  executorDesignated: boolean;
  taxReturnFilingDeadline: string;
  clearanceCertificateRequired: boolean;
  reserveCalculation: boolean;
  installmentSaleDebt: number;
  foreignPropertyLocation: string;
  treatyBenefitsApplicable: boolean;
}

// Section 85 Rollover inputs
interface Rollover85Inputs {
  selectedAssets: number;
  electedAmount: number;
  fmv: number;
  acb: number;
  boot: number;
}

// Departure Tax inputs
interface DepartureTaxInputs {
  emigrationDate: string;
  residenceStatus: 'factual_resident' | 'deemed_resident' | 'non_resident';
  province: 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'NT' | 'NU' | 'YT';
  treatyCountry: string;
  propertyType: 'shares' | 'real_estate' | 'business_assets' | 'investment_portfolio' | 'pension_rights' | 'other';
  fmvAtEmigration: number;
  acb: number;
  exemptProperty: boolean;
  canadianRealEstate: boolean;
  principalResidence: boolean;
  principalResidenceYears: number;
  totalOwnershipYears: number;
  businessProperty: boolean;
  permanentEstablishment: boolean;
  inventoryProperty: boolean;
  rrspRrif: boolean;
  tfsa: boolean;
  stockOptions: boolean;
  securityPosted: boolean;
  securityAmount: number;
  deferralElection: boolean;
  preDepartureRealization: boolean;
  preDepartureRealizedGain: number;
  charitableDonation: boolean;
  donationAmount: number;
  foreignTaxPaid: number;
  treatyRelief: boolean;
  controlledForeignCorp: boolean;
  trustBeneficiary: boolean;
  trustDistributions: number;
  immigrantTrust: boolean;
  t1161Filed: boolean;
  t1243Filed: boolean;
  t1244Filed: boolean;
  clearanceCertificate: boolean;
}

// AMT inputs
interface AMTInputs {
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

// Wind-up inputs
interface Windup88Inputs {
  puc: number;
  grip: number;
  cda: number;
  nerdtoh: number;
  rdtoh: number;
}

type AllInputs = {
  indTax: IndTaxInputs;
  corpTax: CorpTaxInputs;
  corpCapGain: CorpCapGainInputs;
  deathTax: DeathTaxInputs;
  rollover85: Rollover85Inputs;
  departureTax: DepartureTaxInputs;
  amt: AMTInputs;
  windup88: Windup88Inputs;
};

type AllOutputs = {
  indTax?: { netTax: number; marginalRate?: number; effectiveRate?: number; };
  corpTax?: { federalTax: number; provincialTax: number; grip: number; lrip: number; };
  corpCapGain?: { taxableCapitalGain: number; cdaAddition: number; refundableTax: number; };
  deathTax?: { 
    deemedProceeds: number; totalTax: number; netEstateValue: number; liquidityRequired: number;
    // Comprehensive analysis available in detailed output
    deemedDispositionAnalysis?: any; assetValuationAnalysis?: any; capitalGainsCalculation?: any;
    lifetimeCapitalGainsExemption?: any; spouseRolloverAnalysis?: any; summaryActionPlan?: any;
  };
  rollover85?: { minElectedAmount: number; maxElectedAmount: number; cdaBump: number; puc: number; grip: number; };
  departureTax?: { 
    deemedCapitalGain: number; foreignTaxCreditCarryover: number;
    // Comprehensive analysis available in detailed output
    deemedDispositionAnalysis?: any; propertyExemptionAnalysis?: any; internationalTaxRelief?: any;
    summaryRecommendations?: any; securityDeferralAnalysis?: any; complianceRequirements?: any;
  };
  amt?: { 
    tentativeAMT: number; creditCarryForward: number;
    // Comprehensive analysis available in detailed output
    amtExemption?: any; amtAdjustments?: any; finalAMT?: any; summaryMetrics?: any;
    taxPlanningAnalysis?: any; complianceRequirements?: any; multiYearProjections?: any;
  };
  windup88?: { taxFreeDividendBuckets: number; integrationResult: number; };
};

interface ScenarioState {
  year: 2025;
  activeCalculator: CalculatorType;
  inputs: AllInputs;
  outputs: AllOutputs;
  calculatorNotes: { [key: string]: string };
  setActiveCalculator: (calculator: CalculatorType) => void;
  setField: <T extends CalculatorType>(calculator: T, field: keyof AllInputs[T], value: number | string | boolean) => void;
  updateCalculatorNotes: (calculatorKey: string, notes: string) => void;
  recalc: () => void;
}

const defaultInputs: AllInputs = {
  indTax: { 
    salary: 0, eligibleDiv: 0, nonEligibleDiv: 0, otherIncome: 0, capitalGains: 0,
    foreignIncome: 0, rentalIncome: 0, businessIncome: 0, pensionIncome: 0,
    employmentInsurancePremiums: 0, cppContributions: 0, unionDues: 0, 
    professionalFees: 0, employmentExpenses: 0, rrspContribution: 0,
    cppExcessContribution: 0, employmentInsuranceExcess: 0, carryingCharges: 0,
    supportPayments: 0, movingExpenses: 0, childCareExpenses: 0,
    spouseAmount: false, spouseIncome: 0, dependentChildren: 0, childrenOver18: 0,
    caregiver: false, disability: false, disabilityTransfer: 0, tuitionFees: 0,
    medicalExpenses: 0, charitableDonations: 0, politicalContributions: 0,
    alternativeMinimumTax: false, foreignTaxCredits: 0, previousYearMinimumTax: 0,
    otherCredits: 0, age: 30, province: 'QC', maritalStatus: 'single',
    isResident: true, immigrationDate: '', emigrationDate: '',
    fishingCredits: 0, farmingIncome: 0, artistCredits: 0,
    workersSafetyInsurance: 0, employmentInsuranceBenefits: 0, socialAssistance: 0,
    notes: '' 
  },
  corpTax: { abi: 0, sbdEligibility: 100, refundableTaxes: 0, rdtohBalance: 0 },
  corpCapGain: { proceeds: 0, acb: 0, safeIncomeBump: 0, vDay: 0, cdaBalance: 0, outlaysExpenses: 0, reserve: 0 },
  deathTax: { 
    dateOfDeath: '', fmvAtDeath: 0, acb: 0, ucc: 0, propertyType: 'capital', 
    principalResidenceYears: 0, totalOwnershipYears: 0, isQualifiedFarmProperty: false,
    isQualifiedFishingProperty: false, isQualifiedSmallBusinessShares: false,
    usedLifetimeCapitalGainsExemption: 0, charitableDonationElection: false,
    deferralToSpouse: false, spouseRolloverElection: false, alternativeMinimumTax: false,
    netCapitalLossCarryforward: 0, willExists: true, executorDesignated: true,
    taxReturnFilingDeadline: '', clearanceCertificateRequired: false,
    reserveCalculation: false, installmentSaleDebt: 0, foreignPropertyLocation: '',
    treatyBenefitsApplicable: false
  },
  rollover85: { selectedAssets: 0, electedAmount: 0, fmv: 0, acb: 0, boot: 0 },
  departureTax: { 
    emigrationDate: '', residenceStatus: 'factual_resident', province: 'QC', treatyCountry: '',
    propertyType: 'shares', fmvAtEmigration: 0, acb: 0, exemptProperty: false, 
    canadianRealEstate: false, principalResidence: false, principalResidenceYears: 0, 
    totalOwnershipYears: 0, businessProperty: false, permanentEstablishment: false,
    inventoryProperty: false, rrspRrif: false, tfsa: false, stockOptions: false,
    securityPosted: false, securityAmount: 0, deferralElection: false,
    preDepartureRealization: false, preDepartureRealizedGain: 0, charitableDonation: false,
    donationAmount: 0, foreignTaxPaid: 0, treatyRelief: false, controlledForeignCorp: false,
    trustBeneficiary: false, trustDistributions: 0, immigrantTrust: false,
    t1161Filed: false, t1243Filed: false, t1244Filed: false, clearanceCertificate: false
  },
  amt: { 
    taxYear: 2025, province: 'QC', filingStatus: 'individual',
    totalIncome: 0, netIncome: 0, taxableIncome: 0, regularFederalTax: 0,
    capitalGains: 0, capitalGainsDeductions: 0, stockOptionBenefits: 0, stockOptionDeductions: 0,
    cca: 0, resourceAllowances: 0, depletionAllowances: 0, flowThroughDeductions: 0,
    limitedPartnershipLosses: 0, charitableDonations: 0, politicalContributions: 0,
    medicalExpenses: 0, basicPersonalAmount: 15705, spouseCredit: 0, dependentCredits: 0,
    ageCredit: 0, pensionCredit: 0, disabilityCredit: 0, tuitionCredits: 0,
    dividendTaxCredits: 0, foreignTaxCredits: 0, 
    trusts: { designatedIncome: 0, preferredBeneficiary: false, multipleGenerationSkip: false },
    professionalCorporation: false, passiveInvestmentIncome: 0, foreignSourceIncome: 0,
    treatyCountry: '', priorYearAMT: [], priorYearRegularTax: [], amtCreditCarryforward: 0
  },
  windup88: { puc: 0, grip: 0, cda: 0, nerdtoh: 0, rdtoh: 0 }
};

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      year: 2025,
      activeCalculator: 'indTax',
      inputs: defaultInputs,
      outputs: {},
      calculatorNotes: {},
      
      setActiveCalculator: (calculator) => {
        set({ activeCalculator: calculator });
        // Recalculate when switching calculators
        setTimeout(() => get().recalc(), 0);
      },
      
      setField: (calculator, field, value) => {
        set((state) => ({
          inputs: {
            ...state.inputs,
            [calculator]: {
              ...state.inputs[calculator],
              [field]: value,
            },
          },
        }));
        // Auto-recalculate after setting field
        setTimeout(() => get().recalc(), 0);
      },
      
      updateCalculatorNotes: (calculatorKey, notes) => {
        set((state) => ({
          calculatorNotes: {
            ...state.calculatorNotes,
            [calculatorKey]: notes
          }
        }));
      },
      
      recalc: () => {
        const { inputs, activeCalculator } = get();
        const currentInputs = inputs[activeCalculator];
        
        // Safety check - ensure inputs exist and are properly initialized
        if (!currentInputs) {
          console.warn(`No inputs found for ${activeCalculator}, using defaults`);
          set((state) => ({
            inputs: {
              ...state.inputs,
              [activeCalculator]: defaultInputs[activeCalculator]
            }
          }));
          return;
        }
        
        console.log(`Recalculating ${activeCalculator} with inputs:`, currentInputs);
        
        let output: any;
        
        switch (activeCalculator) {
          case 'indTax':
            output = calcIndTax(currentInputs as any);
            // Calculate marginal and effective rates (simplified)
            const totalIncome = (currentInputs as any).salary + (currentInputs as any).eligibleDiv + (currentInputs as any).otherIncome;
            output.marginalRate = totalIncome > 246752 ? 33 + 25.75 : totalIncome > 173205 ? 29 + 25.75 : 45.75;
            output.effectiveRate = totalIncome > 0 ? (output.netTax / totalIncome) * 100 : 0;
            break;
          case 'corpTax':
            output = calcCorpTax(currentInputs as any);
            break;
          case 'corpCapGain':
            output = calcCorpCapGain(currentInputs as any);
            break;
          case 'deathTax':
            const deathResult = calcDeathTax(currentInputs as any);
            output = {
              // Include comprehensive analysis with legacy compatibility
              ...deathResult,
              // Ensure legacy properties are available
              deemedProceeds: deathResult.deemedProceeds || 0,
              totalTax: deathResult.totalTax || 0,
              netEstateValue: deathResult.netEstateValue || 0,
              liquidityRequired: deathResult.liquidityRequired || 0
            };
            break;
          case 'rollover85':
            output = calcRollover85(currentInputs as any);
            break;
          case 'departureTax':
            const departureResult = calcDepartureTax(currentInputs as any);
            output = {
              deemedCapitalGain: departureResult.deemedProceedsCalculation?.capitalGain || 0,
              foreignTaxCreditCarryover: departureResult.internationalTaxRelief?.foreignTaxCredit?.excessCredit || 0,
              // Include comprehensive analysis
              ...departureResult
            };
            break;
          case 'amt':
            const amtResult = calcAMT(currentInputs as any);
            output = {
              tentativeAMT: amtResult.finalAMT?.amtPayable || 0,
              creditCarryForward: amtResult.amtCreditAnalysis?.creditsCarriedForward || 0,
              // Include comprehensive analysis
              ...amtResult
            };
            break;
          case 'windup88':
            output = calcWindup88(currentInputs as any);
            break;
        }
        
        console.log(`Calculated ${activeCalculator} output:`, output);
        set((state) => ({
          outputs: {
            ...state.outputs,
            [activeCalculator]: output
          }
        }));
      },
    }),
    {
      name: 'cookie-tax-scenario',
      version: 2, // Increment version to force migration
      migrate: (persistedState: any, version: number) => {
        // Force reset if version mismatch or corrupted data
        if (version < 2 || !persistedState?.inputs) {
          return {
            year: 2025,
            activeCalculator: 'indTax',
            inputs: defaultInputs,
            outputs: {},
            calculatorNotes: {},
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        // Ensure inputs are properly initialized
        if (state && (!state.inputs || !state.inputs.indTax)) {
          state.inputs = defaultInputs;
        }
        // Recalculate when state is rehydrated from localStorage
        if (state) {
          setTimeout(() => state.recalc(), 0);
        }
      },
    }
  )
); 