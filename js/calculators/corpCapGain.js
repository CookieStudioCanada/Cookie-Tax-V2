// Capital Gains Calculator (Individual & Corporate)
function calcCorpCapGain(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    const proceeds = parseFloat(input.proceeds) || 0;
    const acb = parseFloat(input.acb) || 0;
    const outlaysExpenses = parseFloat(input.outlaysExpenses) || 0;
    const reserve = parseFloat(input.reserve) || 0;
    const safeIncomeBump = parseFloat(input.safeIncomeBump) || 0;
    const vDay = parseFloat(input.vDay) || 0;
    const cdaBalance = parseFloat(input.cdaBalance) || 0;
    const isCorporation = input.isCorporation !== false; // Default to true

    // Capital gain/loss calculation
    const netProceeds = proceeds - outlaysExpenses;
    const capitalGain = netProceeds - acb;
    const realizedGain = capitalGain - reserve; // Gain realized this year
    const taxableCapitalGain = realizedGain * 0.5; // 50% inclusion rate

    let results = {
        taxpayerType: isCorporation ? 'Corporation' : 'Individual',
        proceeds: proceeds,
        outlaysExpenses: outlaysExpenses,
        netProceeds: netProceeds,
        adjustedCostBase: acb,
        capitalGain: capitalGain,
        reserve: reserve,
        realizedGain: realizedGain,
        taxableCapitalGain: taxableCapitalGain
    };

    if (isCorporation) {
        // Corporate-specific calculations
        const cdaAddition = realizedGain * 0.5; // Non-taxable portion goes to CDA
        
        // Safe income bump (reduces capital gain for s. 55(2) purposes)
        const adjustedCapitalGain = Math.max(0, realizedGain - safeIncomeBump);
        const adjustedTaxableGain = adjustedCapitalGain * 0.5;

        // Refundable tax calculation (Part I investment income tax)
        const refundableRate = 0.1067; // 10⅔% refundable tax
        const refundableTax = taxableCapitalGain * refundableRate;

        // Total tax (regular corporate rate + refundable tax)
        const regularTaxRate = 0.27; // 27% federal general rate
        const provincialRate = 0.115; // 11.5% Quebec rate
        const totalTaxRate = regularTaxRate + provincialRate + refundableRate;
        const totalTax = taxableCapitalGain * totalTaxRate;

        // CDA balance after addition
        const newCDABalance = cdaBalance + cdaAddition;

        results = {
            ...results,
            cdaAddition: cdaAddition,
            safeIncomeBump: safeIncomeBump,
            adjustedCapitalGain: adjustedCapitalGain,
            adjustedTaxableGain: adjustedTaxableGain,
            refundableTax: refundableTax,
            regularTax: taxableCapitalGain * (regularTaxRate + provincialRate),
            totalTax: totalTax,
            currentCDABalance: cdaBalance,
            newCDABalance: newCDABalance,
            afterTaxProceeds: netProceeds - totalTax,
            effectiveTaxRate: taxableCapitalGain > 0 ? totalTax / taxableCapitalGain : 0
        };
    } else {
        // Individual calculations
        const federalRate = 0.33; // Top federal rate
        const provincialRate = 0.2575; // Top Quebec rate
        const combinedRate = federalRate + provincialRate;
        
        const totalTax = taxableCapitalGain * combinedRate;
        const marginalRate = combinedRate * 0.5; // Effective rate on capital gains

        results = {
            ...results,
            federalTax: taxableCapitalGain * federalRate,
            provincialTax: taxableCapitalGain * provincialRate,
            totalTax: totalTax,
            marginalRate: marginalRate,
            effectiveTaxRate: taxableCapitalGain > 0 ? totalTax / taxableCapitalGain : 0,
            afterTaxProceeds: netProceeds - totalTax
        };
    }

    return results;
} 