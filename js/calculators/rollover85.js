// Section 85 Rollover Calculator
function calcRollover85(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    const selectedAssets = parseFloat(input.selectedAssets) || 0;
    const electedAmount = parseFloat(input.electedAmount) || 0;
    const fmv = parseFloat(input.fmv) || 0;
    const acb = parseFloat(input.acb) || 0;
    const boot = parseFloat(input.boot) || 0;

    // Validation of elected amount
    const minElectedAmount = Math.max(acb, boot);
    const maxElectedAmount = fmv;
    
    // Ensure elected amount is within valid range
    const validElectedAmount = Math.max(minElectedAmount, Math.min(electedAmount, maxElectedAmount));

    // Calculate gain/loss recognition
    const recognizedGain = validElectedAmount - acb;
    const deferredGain = fmv - validElectedAmount;

    // Share consideration calculation
    const shareConsideration = validElectedAmount - boot;
    const shareCostBase = shareConsideration;

    // PUC calculation (paid-up capital grinding)
    const pucBefore = 0; // Assuming new shares
    const pucIncrease = Math.max(0, validElectedAmount - boot);
    const pucGrinding = Math.max(0, (fmv - acb) - (validElectedAmount - acb));
    const pucAfter = pucBefore + pucIncrease - pucGrinding;

    // GRIP/CDA implications (if corporate transferor)
    const gripBump = recognizedGain > 0 ? recognizedGain * 0.72 : 0; // Simplified
    const cdaBump = 0; // No CDA bump on s.85 transfer typically

    // Tax implications
    const immediateTax = recognizedGain * 0.5 * 0.5; // Simplified tax calculation
    const deferredTaxPotential = deferredGain * 0.5 * 0.5;

    return {
        fmv: fmv,
        acb: acb,
        boot: boot,
        electedAmount: validElectedAmount,
        minElectedAmount: minElectedAmount,
        maxElectedAmount: maxElectedAmount,
        recognizedGain: recognizedGain,
        deferredGain: deferredGain,
        shareConsideration: shareConsideration,
        shareCostBase: shareCostBase,
        pucAfter: pucAfter,
        pucGrinding: pucGrinding,
        gripBump: gripBump,
        cdaBump: cdaBump,
        immediateTax: immediateTax,
        deferredTaxPotential: deferredTaxPotential,
        validElection: validElectedAmount >= minElectedAmount && validElectedAmount <= maxElectedAmount
    };
} 