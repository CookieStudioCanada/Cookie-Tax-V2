// Capital Gains Calculator - Enhanced Structure
function calcCorpCapGain(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    const isCorporation = input.isCorporation || false;
    const proceeds = parseFloat(input.proceeds) || 0;
    const acb = parseFloat(input.acb) || 0;
    const outlaysExpenses = parseFloat(input.outlaysExpenses) || 0;
    const reserve = parseFloat(input.reserve) || 0;
    const safeIncomeBump = parseFloat(input.safeIncomeBump) || 0;
    const vDay = parseFloat(input.vDay) || 0;
    const cdaBalance = parseFloat(input.cdaBalance) || 0;
    const rdtohEligible = parseFloat(input.rdtohEligible) || 0;
    const rdtohNonEligible = parseFloat(input.rdtohNonEligible) || 0;
    const numberOfShares = parseFloat(input.numberOfShares) || 1;
    const province = input.province || 'QC';

    // Calculate capital gain/loss
    const netProceeds = proceeds - outlaysExpenses;
    const grossGain = netProceeds - acb;
    
    // Apply V-day value if applicable and beneficial
    const vDayAdjustment = vDay > acb ? vDay - acb : 0;
    const adjustedGain = Math.max(0, grossGain - vDayAdjustment);
    
    // Apply safe income bump for corporate sales
    const safeIncomeBumpTotal = isCorporation ? safeIncomeBump * numberOfShares : 0;
    const finalGain = Math.max(0, adjustedGain - safeIncomeBumpTotal - reserve);
    
    const capitalGain = finalGain;
    const taxableCapitalGain = capitalGain * 0.5;
    const nonTaxableCapitalGain = capitalGain * 0.5;

    // Individual tax calculation
    if (!isCorporation) {
        // Use simplified marginal rates for different provinces
        let marginalRate;
        if (province === 'QC') {
            marginalRate = 0.485; // Approximate top marginal rate in Quebec
        } else if (province === 'ON') {
            marginalRate = 0.465; // Approximate top marginal rate in Ontario
        } else {
            marginalRate = 0.45; // Default rate
        }
        
        const taxOnGain = taxableCapitalGain * marginalRate;
        const afterTaxProceeds = netProceeds - taxOnGain;
        const effectiveRate = capitalGain > 0 ? taxOnGain / capitalGain : 0;

        return {
            // Transaction details
            proceeds: proceeds,
            outlaysExpenses: outlaysExpenses,
            netProceeds: netProceeds,
            acb: acb,
            
            // Gain calculations
            grossGain: grossGain,
            vDayAdjustment: vDayAdjustment,
            safeIncomeBumpTotal: safeIncomeBumpTotal,
            reserve: reserve,
            capitalGain: finalGain,
            taxableCapitalGain: taxableCapitalGain,
            nonTaxableCapitalGain: nonTaxableCapitalGain,
            
            // Tax calculations
            marginalRate: marginalRate,
            taxOnGain: taxOnGain,
            effectiveRate: effectiveRate,
            afterTaxProceeds: afterTaxProceeds,
            
            // Flags
            isCorporation: false,
            province: province
        };
    }

    // Corporate tax calculation
    const corporateTax = taxableCapitalGain * 0.27; // Simplified corporate rate
    const refundableTax = taxableCapitalGain * 0.3067; // 30 2/3% refundable portion
    
    // Account calculations
    const cdaAddition = nonTaxableCapitalGain;
    const newCdaBalance = cdaBalance + cdaAddition;
    const rdtohEligibleAddition = refundableTax * 0.3067; // Simplified
    const newRdtohEligible = rdtohEligible + rdtohEligibleAddition;
    
    // Integration test - compare to individual taxation
    const corporateIntegratedTax = corporateTax; // Would need dividend calculations
    const afterTaxCorporateIncome = capitalGain - corporateTax;

    return {
        // Transaction details
        proceeds: proceeds,
        outlaysExpenses: outlaysExpenses,
        netProceeds: netProceeds,
        acb: acb,
        numberOfShares: numberOfShares,
        
        // Gain calculations
        grossGain: grossGain,
        vDayAdjustment: vDayAdjustment,
        safeIncomeBumpTotal: safeIncomeBumpTotal,
        reserve: reserve,
        capitalGain: finalGain,
        taxableCapitalGain: taxableCapitalGain,
        nonTaxableCapitalGain: nonTaxableCapitalGain,
        
        // Tax calculations
        corporateTax: corporateTax,
        refundableTax: refundableTax,
        afterTaxCorporateIncome: afterTaxCorporateIncome,
        
        // Account updates
        cdaAddition: cdaAddition,
        newCdaBalance: newCdaBalance,
        rdtohEligibleAddition: rdtohEligibleAddition,
        newRdtohEligible: newRdtohEligible,
        
        // Previous balances
        cdaBalance: cdaBalance,
        rdtohEligible: rdtohEligible,
        rdtohNonEligible: rdtohNonEligible,
        
        // Integration analysis
        corporateIntegratedTax: corporateIntegratedTax,
        
        // Safe income
        safeIncomeBump: safeIncomeBump,
        
        // Flags
        isCorporation: true,
        province: province
    };
} 