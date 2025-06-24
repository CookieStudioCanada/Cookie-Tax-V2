// Enhanced Wind-up (s.88(1)) Calculator - Enhanced Structure
function calcWindup88(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    // Inputs
    const parentAcbInSub = parseFloat(input.parentAcbInSub) || 0;
    const subNetAssetFmv = parseFloat(input.subNetAssetFmv) || 0;
    const subAssetTaxCost = parseFloat(input.subAssetTaxCost) || 0;
    const subPuc = parseFloat(input.subPuc) || 0;
    const subLiabilities = parseFloat(input.subLiabilities) || 0;
    const subCda = parseFloat(input.subCda) || 0;
    const subGrip = parseFloat(input.subGrip) || 0;
    const nonDepreciableFmv = parseFloat(input.nonDepreciableFmv) || 0;
    const nonDepreciableAcb = parseFloat(input.nonDepreciableAcb) || 0;

    // --- Wind-up Calculations (s.88(1)) ---

    // 1. Deemed Dividend to Parent
    const subNetAssetsForDividend = subNetAssetFmv - subLiabilities;
    const deemedDividend = Math.max(0, subNetAssetsForDividend - subPuc);

    // 2. Allocate Deemed Dividend to Tax Accounts
    let remainingDividend = deemedDividend;
    const cdaDividend = Math.min(remainingDividend, subCda);
    remainingDividend -= cdaDividend;
    const gripDividend = Math.min(remainingDividend, subGrip);
    remainingDividend -= gripDividend;
    const taxableDividend = remainingDividend;

    // 3. Parent's Proceeds on Sub Shares (No Gain/Loss)
    const parentProceedsOnShares = parentAcbInSub;

    // 4. "Bump" Calculation for Non-Depreciable Capital Property
    const bumpLimit = Math.max(0, parentAcbInSub - (subAssetTaxCost - subLiabilities));
    const maxAssetBump = Math.max(0, nonDepreciableFmv - nonDepreciableAcb);
    const availableBump = Math.min(bumpLimit, maxAssetBump);

    const newAssetCostForParent = nonDepreciableAcb + availableBump;

    return {
        // Deemed Dividend to Parent
        deemedDividend: deemedDividend,
        cdaDividend: cdaDividend,
        gripDividend: gripDividend,
        taxableDividend: taxableDividend,
        
        // Parent's Share Disposition
        parentProceedsOnShares: parentProceedsOnShares,
        parentGainOnShares: 0, // No gain or loss under s.88(1)
        
        // Asset Bump (s.88(1)(d))
        bumpLimit: bumpLimit,
        availableBump: availableBump,
        newAssetCostForParent: newAssetCostForParent,
        
        note: "This is a simplified s.88(1) wind-up. Complex rules apply."
    };
}

// Enhanced Wind-up form loader
function loadWindup88Form(container) {
    container.innerHTML = '';
    container.className = 'fade-in';

    const inputs = calculatorInputs.windup88;
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';
    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless align-middle';
    const tbody = document.createElement('tbody');

    const addSectionHeader = (title) => {
        const tr = document.createElement('tr');
        tr.className = 'table-light';
        tr.innerHTML = `<th colspan="2" class="fw-semibold text-cookie-brown">${title}</th>`;
        tbody.appendChild(tr);
    };

    const addInputRow = (label, key) => {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.textContent = label;
        tr.appendChild(tdLabel);

        const tdInput = document.createElement('td');
        const inputEl = document.createElement('input');
        inputEl.type = 'number';
        inputEl.value = inputs[key] || 0;
        inputEl.className = 'form-control form-control-sm text-end';
        inputEl.onchange = () => updateInput('windup88', key, inputEl);
        tdInput.appendChild(inputEl);
        tr.appendChild(tdInput);
        tbody.appendChild(tr);
    };

    addSectionHeader("ParentCo's Investment in SubCo");
    addInputRow("Parent's ACB in SubCo Shares", 'parentAcbInSub');

    addSectionHeader("SubCo's Financial Position");
    addInputRow('FMV of All Assets Distributed', 'subNetAssetFmv');
    addInputRow('Aggregate Tax Cost of All Assets', 'subAssetTaxCost');
    addInputRow('Liabilities Assumed by Parent', 'subLiabilities');
    addInputRow('Paid-Up Capital (PUC) of SubCo Shares', 'subPuc');

    addSectionHeader("SubCo's Tax Accounts");
    addInputRow('Capital Dividend Account (CDA)', 'subCda');
    addInputRow('General Rate Income Pool (GRIP)', 'subGrip');

    addSectionHeader('Asset Bump Calculation (s.88(1)(d))');
    addInputRow('FMV of Non-Depreciable Capital Property', 'nonDepreciableFmv');
    addInputRow('ACB of Non-Depreciable Capital Property', 'nonDepreciableAcb');

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
} 