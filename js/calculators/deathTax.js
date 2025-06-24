// Death Tax Calculator
function calcDeathTax(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    const fmvAtDeath = parseFloat(input.fmvAtDeath) || 0;
    const acb = parseFloat(input.acb) || 0;
    const propertyType = input.propertyType || 'capital';
    const deferralToSpouse = input.deferralToSpouse || false;

    // Deemed disposition calculation
    const deemedProceeds = fmvAtDeath;
    const capitalGain = deemedProceeds - acb;
    const taxableCapitalGain = capitalGain * 0.5; // 50% inclusion rate

    // Tax calculation (simplified - using top marginal rates)
    const federalRate = 0.33; // Top federal rate
    const provincialRate = 0.2575; // Top Quebec rate
    const combinedRate = federalRate + provincialRate;

    let taxableIncome = taxableCapitalGain;
    let totalTax = 0;

    if (!deferralToSpouse) {
        // Calculate tax on deemed disposition
        totalTax = taxableIncome * combinedRate;
    } else {
        // Spousal rollover - no immediate tax
        totalTax = 0;
        taxableIncome = 0;
    }

    // Estate calculations
    const netEstateValue = fmvAtDeath - totalTax;
    const liquidityRequired = totalTax;

    // Probate fees (estimated for Quebec)
    const probateFees = Math.min(fmvAtDeath * 0.005, 1000); // Simplified Quebec probate

    // Total costs
    const totalCosts = totalTax + probateFees;
    const finalNetEstate = fmvAtDeath - totalCosts;

    return {
        fmvAtDeath: fmvAtDeath,
        adjustedCostBase: acb,
        deemedProceeds: deemedProceeds,
        capitalGain: capitalGain,
        taxableCapitalGain: taxableCapitalGain,
        taxableIncome: taxableIncome,
        totalTax: totalTax,
        probateFees: probateFees,
        totalCosts: totalCosts,
        netEstateValue: netEstateValue,
        finalNetEstate: finalNetEstate,
        liquidityRequired: liquidityRequired,
        spouseRollover: deferralToSpouse,
        propertyType: propertyType
    };
} 