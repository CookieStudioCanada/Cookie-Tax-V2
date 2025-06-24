// Alternative Minimum Tax Calculator
function calcAmt(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    const adjustedTaxableIncome = parseFloat(input.adjustedTaxableIncome) || 0;
    const preferenceItems = parseFloat(input.preferenceItems) || 0;
    const capitalGainsPercentage = parseFloat(input.capitalGainsPercentage) || 100;

    // AMT calculation parameters (2024+ reforms)
    const amtExemption = 173000; // Increased from $40,000
    const amtRate = 0.205; // Increased from 15%

    // Calculate AMT base
    const amtBase = adjustedTaxableIncome + preferenceItems;
    
    // Apply enhanced capital gains inclusion for AMT
    const enhancedCapitalGains = (capitalGainsPercentage / 100) * adjustedTaxableIncome * 0.5; // Additional 50% inclusion
    const amtTaxableIncome = amtBase + enhancedCapitalGains;

    // Calculate tentative AMT
    const exemptIncome = Math.min(amtTaxableIncome, amtExemption);
    const taxableForAMT = Math.max(0, amtTaxableIncome - amtExemption);
    const tentativeAMT = taxableForAMT * amtRate;

    // Regular tax (simplified calculation)
    const regularTax = adjustedTaxableIncome * 0.33; // Simplified using top rate

    // AMT payable is excess of tentative AMT over regular tax
    const amtPayable = Math.max(0, tentativeAMT - regularTax);

    // Credit carryforward calculation
    const creditCarryForward = amtPayable; // Simplified - can carry forward for 7 years

    // Five-year projection of potential credit usage
    const projectedCreditUsage = creditCarryForward * 0.2; // Assume 20% usage per year

    return {
        adjustedTaxableIncome: adjustedTaxableIncome,
        preferenceItems: preferenceItems,
        amtBase: amtBase,
        enhancedCapitalGains: enhancedCapitalGains,
        amtTaxableIncome: amtTaxableIncome,
        amtExemption: amtExemption,
        taxableForAMT: taxableForAMT,
        tentativeAMT: tentativeAMT,
        regularTax: regularTax,
        amtPayable: amtPayable,
        creditCarryForward: creditCarryForward,
        projectedCreditUsage: projectedCreditUsage,
        effectiveAMTRate: amtTaxableIncome > 0 ? tentativeAMT / amtTaxableIncome : 0,
        amtTriggered: amtPayable > 0
    };
} 