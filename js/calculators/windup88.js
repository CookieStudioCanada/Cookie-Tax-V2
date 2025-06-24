// Section 88 Wind-up Calculator
function calcWindup88(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    const puc = parseFloat(input.puc) || 0;
    const grip = parseFloat(input.grip) || 0;
    const cda = parseFloat(input.cda) || 0;
    const nerdtoh = parseFloat(input.nerdtoh) || 0;
    const rdtoh = parseFloat(input.rdtoh) || 0;

    // Wind-up distribution analysis
    
    // Step 1: Capital dividend distribution (from CDA)
    const capitalDividend = Math.min(cda, puc); // Limited by PUC
    const remainingCDA = cda - capitalDividend;
    
    // Step 2: Eligible dividend distribution (from GRIP)
    const eligibleDividend = Math.min(grip, puc - capitalDividend);
    const remainingGRIP = grip - eligibleDividend;
    
    // Step 3: Non-eligible dividend distribution (remainder)
    const nonEligibleDividend = Math.max(0, puc - capitalDividend - eligibleDividend);
    
    // Step 4: Calculate dividend refunds
    const eligibleRefund = Math.min(rdtoh, eligibleDividend * (1/3)); // 1/3 refund rate
    const nonEligibleRefund = Math.min(nerdtoh, nonEligibleDividend * (38.33/100)); // 38⅓% refund rate
    const totalRefund = eligibleRefund + nonEligibleRefund;
    
    // Tax-free dividend buckets
    const taxFreeDividendBuckets = capitalDividend + (totalRefund * 0.72); // Simplified integration
    
    // Integration analysis
    const totalDistribution = capitalDividend + eligibleDividend + nonEligibleDividend;
    const integrationResult = totalDistribution - (eligibleDividend * 0.38) - (nonEligibleDividend * 0.15); // Simplified
    
    // Remaining balances after wind-up
    const remainingRDTOH = rdtoh - eligibleRefund;
    const remainingNERDTOH = nerdtoh - nonEligibleRefund;
    
    // Shareholder tax implications (simplified)
    const shareholderTaxOnEligible = eligibleDividend * 0.38 * 0.25; // Grossed up and taxed
    const shareholderTaxOnNonEligible = nonEligibleDividend * 0.15 * 0.45; // Grossed up and taxed
    const totalShareholderTax = shareholderTaxOnEligible + shareholderTaxOnNonEligible;
    
    return {
        paidUpCapital: puc,
        gripBalance: grip,
        cdaBalance: cda,
        nerdtohBalance: nerdtoh,
        rdtohBalance: rdtoh,
        capitalDividend: capitalDividend,
        eligibleDividend: eligibleDividend,
        nonEligibleDividend: nonEligibleDividend,
        totalDistribution: totalDistribution,
        eligibleRefund: eligibleRefund,
        nonEligibleRefund: nonEligibleRefund,
        totalRefund: totalRefund,
        taxFreeDividendBuckets: taxFreeDividendBuckets,
        integrationResult: integrationResult,
        remainingGRIP: remainingGRIP,
        remainingCDA: remainingCDA,
        remainingRDTOH: remainingRDTOH,
        remainingNERDTOH: remainingNERDTOH,
        shareholderTaxOnEligible: shareholderTaxOnEligible,
        shareholderTaxOnNonEligible: shareholderTaxOnNonEligible,
        totalShareholderTax: totalShareholderTax,
        netToShareholder: totalDistribution - totalShareholderTax
    };
} 