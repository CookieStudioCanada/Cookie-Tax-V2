// Section 85 Rollover Calculator - Enhanced Structure
function calcRollover85(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    // Inputs
    const propertyType = input.propertyType || 'capital';
    const fmv = parseFloat(input.fmv) || 0;
    const acb = parseFloat(input.acb) || 0;
    const ucc = parseFloat(input.ucc) || 0;
    const boot = parseFloat(input.boot) || 0;
    let electedAmount = parseFloat(input.electedAmount) || 0;
    const isIndividual = input.isIndividual || false;

    // Determine cost base for calculation based on property type
    const costBase = propertyType === 'depreciable' ? ucc : acb;

    // Determine the valid range for the elected amount
    const lowerLimit = Math.max(boot, 0);
    const upperLimit = fmv;
    
    // Auto-adjust elected amount if it's zero or outside bounds for a basic deferral
    if (electedAmount === 0 || electedAmount < lowerLimit || electedAmount > upperLimit) {
        electedAmount = Math.max(lowerLimit, Math.min(upperLimit, costBase));
    }
    
    const proceeds = electedAmount;
    
    let incomeInclusion = 0;
    let inclusionType = '';
    
    if (proceeds > costBase) {
        if (propertyType === 'depreciable') {
            const capitalCost = acb; // Assuming ACB is capital cost for depreciable property
            const maxRecapture = Math.max(0, capitalCost - ucc);
            const potentialRecapture = Math.max(0, proceeds - ucc);
            const recapture = Math.min(potentialRecapture, maxRecapture);
            
            const capitalGain = Math.max(0, proceeds - capitalCost);
            incomeInclusion = recapture + (capitalGain * 0.5);
            inclusionType = 'Recapture & Taxable Capital Gain';
        } else {
            const capitalGain = proceeds - costBase;
            incomeInclusion = capitalGain * 0.5;
            inclusionType = 'Taxable Capital Gain';
        }
    }

    // PUC & ACB of shares received
    const sharesAcb = Math.max(0, electedAmount - boot);
    const maxPuc = sharesAcb; // Simplified PUC, ignoring PUC grind rules for now

    // s.84.1 Deemed Dividend - basic check
    let deemedDividend84_1 = 0;
    if (isIndividual && boot > 0) {
        // Simplified check: s.84.1 can apply if boot is received for shares transferred
        // and there's a difference between PUC and ACB of old shares (not modeled here).
        // For simplicity, we flag a potential issue.
        deemedDividend84_1 = 'Potential s.84.1 application. Consult a professional.';
    }

    // Corporation's perspective
    const corpPropertyCost = electedAmount;

    return {
        // Election details
        electedAmount: electedAmount,
        validRange: `From $${lowerLimit.toLocaleString()} to $${upperLimit.toLocaleString()}`,
        
        // Transferor's Consequences
        proceeds: proceeds,
        incomeInclusion: incomeInclusion,
        inclusionType: inclusionType,
        sharesAcb: sharesAcb,
        deemedDividend84_1: deemedDividend84_1,

        // Corporation's Consequences
        corpPropertyCost: corpPropertyCost,
        
        // Input summary
        propertyType: propertyType,
        fmv: fmv,
        boot: boot
    };
}

// Enhanced Section 85 form loader
function loadRollover85Form(container) {
    container.innerHTML = '';
    container.className = 'fade-in';

    const inputs = calculatorInputs.rollover85;

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

    const addInputRow = (label, key, type = 'number', options = []) => {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.innerHTML = label;
        tr.appendChild(tdLabel);

        const tdInput = document.createElement('td');
        let inputEl;

        if (type === 'select') {
            inputEl = document.createElement('select');
            inputEl.className = 'form-select form-select-sm';
            options.forEach(opt => {
                const optionEl = document.createElement('option');
                optionEl.value = opt.value;
                optionEl.textContent = opt.label;
                if (inputs[key] === opt.value) optionEl.selected = true;
                inputEl.appendChild(optionEl);
            });
            inputEl.onchange = () => updateInput('rollover85', key, inputEl);
        } else { // number
            inputEl = document.createElement('input');
            inputEl.type = 'number';
            inputEl.value = inputs[key] || 0;
            inputEl.min = '0';
            inputEl.step = '0.01';
            inputEl.className = 'form-control form-control-sm text-end';
            inputEl.onchange = () => updateInput('rollover85', key, inputEl);
        }
        
        tdInput.appendChild(inputEl);
        tr.appendChild(tdInput);
        tbody.appendChild(tr);
    };

    addSectionHeader('Property Transferred');
    addInputRow('Property Type', 'propertyType', 'select', [
        { value: 'capital', label: 'Capital Property' },
        { value: 'depreciable', label: 'Depreciable Property' },
        { value: 'inventory', label: 'Inventory' }
    ]);
    addInputRow('Fair Market Value (FMV)', 'fmv');
    addInputRow('Adjusted Cost Base (ACB)', 'acb');
    addInputRow('Undepreciated Capital Cost (UCC)', 'ucc');

    addSectionHeader('Consideration Received');
    addInputRow('Non-Share Consideration (Boot)', 'boot');

    addSectionHeader('Election (T2057)');
    addInputRow('Elected Amount (0 for auto-deferral)', 'electedAmount');

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
} 