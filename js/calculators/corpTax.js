// Corporate Tax Calculator
function calcCorpTax(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    const abi = parseFloat(input.abi) || 0;
    const sbdEligibility = parseFloat(input.sbdEligibility) || 100;
    const refundableTaxes = parseFloat(input.refundableTaxes) || 0;
    const rdtohBalance = parseFloat(input.rdtohBalance) || 0;

    // Small Business Deduction calculation
    const sbdIncome = Math.min(abi * (sbdEligibility / 100), 500000); // SBD limit is $500,000
    const generalRateIncome = abi - sbdIncome;

    // Federal tax rates
    const sbdRate = 0.09; // 9% federal small business rate
    const generalRate = 0.27; // 27% federal general rate (38% - 10% - 1%)

    // Provincial tax rates (simplified for Quebec)
    const provincialSBDRate = 0.033; // 3.3% Quebec small business rate
    const provincialGeneralRate = 0.115; // 11.5% Quebec general rate

    // Calculate taxes
    const federalSBDTax = sbdIncome * sbdRate;
    const federalGeneralTax = generalRateIncome * generalRate;
    const provincialSBDTax = sbdIncome * provincialSBDRate;
    const provincialGeneralTax = generalRateIncome * provincialGeneralRate;

    const totalFederalTax = federalSBDTax + federalGeneralTax;
    const totalProvincialTax = provincialSBDTax + provincialGeneralTax;
    const totalTax = totalFederalTax + totalProvincialTax;

    // GRIP calculation (General Rate Income Pool)
    const gripAddition = generalRateIncome - (generalRateIncome * 0.3067); // Net of refundable tax

    // LRIP calculation (Low Rate Income Pool)
    const lripAddition = sbdIncome;

    // Integration test
    const combinedRate = sbdIncome > 0 ? 
        ((federalSBDTax + provincialSBDTax) / sbdIncome) : 0;

    return {
        activeBusinessIncome: abi,
        sbdEligibleIncome: sbdIncome,
        generalRateIncome: generalRateIncome,
        federalTax: totalFederalTax,
        provincialTax: totalProvincialTax,
        totalTax: totalTax,
        federalSBDTax: federalSBDTax,
        federalGeneralTax: federalGeneralTax,
        provincialSBDTax: provincialSBDTax,
        provincialGeneralTax: provincialGeneralTax,
        gripAddition: gripAddition,
        lripAddition: lripAddition,
        combinedSBDRate: combinedRate,
        afterTaxIncome: abi - totalTax,
        refundableTaxes: refundableTaxes,
        rdtohBalance: rdtohBalance
    };
} 