// Departure Tax Calculator
function calcDepartureTax(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    const fmvAtEmigration = parseFloat(input.fmvAtEmigration) || 0;
    const acb = parseFloat(input.acb) || 0;
    const exemptPropertyFlag = input.exemptPropertyFlag || false;

    // Deemed disposition calculation
    let deemedProceeds = 0;
    let capitalGain = 0;
    let taxableCapitalGain = 0;

    if (!exemptPropertyFlag) {
        deemedProceeds = fmvAtEmigration;
        capitalGain = deemedProceeds - acb;
        taxableCapitalGain = Math.max(0, capitalGain * 0.5); // 50% inclusion rate
    }

    // Tax calculation (using top marginal rates)
    const federalRate = 0.33; // Top federal rate
    const combinedRate = federalRate; // Federal only for departure tax

    const taxPayable = taxableCapitalGain * combinedRate;

    // Security requirements (if deferral elected)
    const securityRequired = taxPayable; // 100% security typically required

    // Foreign tax credit considerations
    const foreignTaxCreditCarryover = 0; // Simplified - depends on foreign country

    // Five-year rule implications
    const fiveYearDeferralAvailable = true; // Simplified
    const annualInterest = taxPayable * 0.03; // Prescribed rate interest

    return {
        fmvAtEmigration: fmvAtEmigration,
        adjustedCostBase: acb,
        exemptProperty: exemptPropertyFlag,
        deemedProceeds: deemedProceeds,
        capitalGain: capitalGain,
        taxableCapitalGain: taxableCapitalGain,
        taxPayable: taxPayable,
        securityRequired: securityRequired,
        foreignTaxCreditCarryover: foreignTaxCreditCarryover,
        fiveYearDeferralAvailable: fiveYearDeferralAvailable,
        annualInterest: annualInterest,
        totalDeferredCost: taxPayable + (annualInterest * 5),
        afterTaxValue: fmvAtEmigration - taxPayable
    };
} 