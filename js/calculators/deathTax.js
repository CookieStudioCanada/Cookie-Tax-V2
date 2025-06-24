// Death Tax & Estate Planning Calculator - Enhanced Structure
function calcDeathTax(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    // Deemed disposition inputs
    const fmvCapitalProperty = parseFloat(input.fmvCapitalProperty) || 0;
    const acbCapitalProperty = parseFloat(input.acbCapitalProperty) || 0;
    const fmvDepreciableProperty = parseFloat(input.fmvDepreciableProperty) || 0;
    const costDepreciableProperty = parseFloat(input.costDepreciableProperty) || 0;
    const uccDepreciableProperty = parseFloat(input.uccDepreciableProperty) || 0;
    const rrspRifValue = parseFloat(input.rrspRifValue) || 0;
    
    // Other income for final return
    const otherFinalIncome = parseFloat(input.otherFinalIncome) || 0;
    
    // Rollover election
    const spousalRollover = input.spousalRollover || false;
    const province = input.province || 'QC';

    // If full spousal rollover, tax is deferred
    if (spousalRollover) {
        const otherIncomeTax = calculateTaxOnIncome(otherFinalIncome, taxRates.fed) + calculateTaxOnIncome(otherFinalIncome, taxRates.qc); // Simplified
        return {
            totalIncomeOnFinalReturn: otherFinalIncome,
            deemedDispositionIncome: 0,
            taxOnDeemedDisposition: 0,
            totalTaxOnFinalReturn: otherIncomeTax,
            spousalRolloverElected: true,
            note: 'All assets are rolled over to the spouse at their cost base. Tax is deferred.'
        };
    }

    // 1. Capital Gain on Capital Property
    const capitalGain = Math.max(0, fmvCapitalProperty - acbCapitalProperty);
    const taxableCapitalGain = capitalGain * 0.5;

    // 2. Recapture & Capital Gain on Depreciable Property
    const proceedsDepreciable = Math.min(fmvDepreciableProperty, costDepreciableProperty);
    const recapture = Math.max(0, proceedsDepreciable - uccDepreciableProperty);
    const capitalGainDepreciable = Math.max(0, fmvDepreciableProperty - costDepreciableProperty);
    const taxableCapitalGainDepreciable = capitalGainDepreciable * 0.5;

    // 3. RRSP/RRIF Income
    const rrspIncome = rrspRifValue;

    // Total income from deemed disposition
    const deemedDispositionIncome = taxableCapitalGain + recapture + taxableCapitalGainDepreciable + rrspIncome;
    const totalIncomeOnFinalReturn = deemedDispositionIncome + otherFinalIncome;

    // Calculate tax on the final return
    const federalTax = calculateTaxOnIncome(totalIncomeOnFinalReturn, taxRates.fed);
    
    let provincialTax, quebecAbatement = 0;
    if (province === 'QC') {
        provincialTax = calculateTaxOnIncome(totalIncomeOnFinalReturn, taxRates.qc);
        quebecAbatement = federalTax * 0.165;
    } else {
        provincialTax = 0; // Placeholder for other provinces
    }
    
    const federalBasicPersonalAmount = 15000;
    const provincialBasicPersonalAmount = province === 'QC' ? 16143 : 14398;
    const federalBasicCredit = federalBasicPersonalAmount * 0.15;
    const provincialBasicCredit = provincialBasicPersonalAmount * (province === 'QC' ? 0.14 : 0.05);
    
    const netFederalTax = Math.max(0, federalTax - federalBasicCredit - quebecAbatement);
    const netProvincialTax = Math.max(0, provincialTax - provincialBasicCredit);
    const totalTax = netFederalTax + netProvincialTax;

    const taxOnOtherIncomeFederal = calculateTaxOnIncome(otherFinalIncome, taxRates.fed);
    const taxOnOtherIncomeProvincial = province === 'QC' ? calculateTaxOnIncome(otherFinalIncome, taxRates.qc) : 0;
    const taxOnOtherIncome = Math.max(0, taxOnOtherIncomeFederal - federalBasicCredit) + Math.max(0, taxOnOtherIncomeProvincial - provincialBasicCredit);
    const taxOnDeemedDisposition = totalTax - taxOnOtherIncome;

    return {
        // Income components
        taxableCapitalGain,
        recapture,
        taxableCapitalGainDepreciable,
        rrspIncome,
        deemedDispositionIncome,
        otherFinalIncome,
        totalIncomeOnFinalReturn,
        
        // Tax Calculation
        totalTaxOnFinalReturn: totalTax,
        taxOnDeemedDisposition: Math.max(0, taxOnDeemedDisposition),
        
        // Rollover flag
        spousalRolloverElected: spousalRollover,
        
        // Breakdown
        netFederalTax,
        netProvincialTax,
        quebecAbatement,
    };
}

// Helper function to calculate tax on income using progressive brackets
function calculateTaxOnIncome(income, brackets) {
    let tax = 0;
    let remainingIncome = income;

    for (const bracket of brackets) {
        if (remainingIncome <= 0) break;

        const bracketIncome = Math.min(remainingIncome, bracket.max - bracket.min);
        tax += bracketIncome * bracket.rate;
        remainingIncome -= bracketIncome;

        if (remainingIncome <= 0) break;
    }

    return tax;
}

// Global variables for the Death Tax quiz
let deathTaxQuizStep = 0;
let deathTaxQuizAnswers = {};
let deathTaxAssets = []; // To hold the list of assets

// Enhanced Death Tax form loader
function loadDeathTaxForm(container) {
    const headerActions = document.getElementById('inputFormHeaderActions');
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm" onclick="startDeathTaxQuiz()">
            <i class="bi bi-question-circle"></i>
            <span class="d-none d-md-inline">Assistant</span>
        </button>
    `;

    container.innerHTML = '';
    container.className = 'fade-in';

    const inputs = calculatorInputs.deathTax;

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

    const addInputRow = (label, key, lineNumber = null, isCheckbox = false) => {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.innerHTML = `${lineNumber ? `<small class="text-muted">${lineNumber}</small> ` : ''}${label}`;
        tr.appendChild(tdLabel);

        const tdInput = document.createElement('td');
        
        if (isCheckbox) {
            const checkboxEl = document.createElement('input');
            checkboxEl.type = 'checkbox';
            checkboxEl.checked = inputs[key] || false;
            checkboxEl.className = 'form-check-input';
            checkboxEl.onchange = (e) => updateInput('deathTax', key, checkboxEl);
            tdInput.appendChild(checkboxEl);
        } else {
            const inputEl = document.createElement('input');
            inputEl.type = 'number';
            inputEl.value = inputs[key] || 0;
            inputEl.min = '0';
            inputEl.step = '0.01';
            inputEl.className = 'form-control form-control-sm text-end';
            inputEl.onchange = (e) => updateInput('deathTax', key, inputEl);
            tdInput.appendChild(inputEl);
        }
        tr.appendChild(tdInput);
        tbody.appendChild(tr);
    };

    // Deemed Disposition section
    addSectionHeader('Deemed Disposition at Death (s.70(5))');
    addInputRow('FMV of Capital Property', 'fmvCapitalProperty');
    addInputRow('ACB of Capital Property', 'acbCapitalProperty');
    addSectionHeader('Depreciable Property');
    addInputRow('FMV of Depreciable Property', 'fmvDepreciableProperty');
    addInputRow('Cost of Depreciable Property', 'costDepreciableProperty');
    addInputRow('UCC of Depreciable Property', 'uccDepreciableProperty');
    addSectionHeader('Registered Plans');
    addInputRow('Value of RRSP/RRIF', 'rrspRifValue');
    
    // Other income
    addSectionHeader('Other Final Return Income');
    addInputRow('Other income in year of death', 'otherFinalIncome');

    // Rollover
    addSectionHeader('Estate Planning Elections');
    addInputRow('Elect full spousal rollover? (s.70(6))', 'spousalRollover', null, true);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// --- Re-integrated Quiz Logic for Death Tax ---

const deathTaxQuizQuestions = [
    {
        id: 'spousalRollover',
        question: "Is the entire estate being left to a surviving spouse or common-law partner, allowing for a tax-deferred rollover under s.70(6)?",
        type: 'boolean',
        info: "If yes, the deemed disposition happens at your cost base, deferring any capital gains tax."
    },
    {
        id: 'manageAssets',
        question: "Manage Estate Assets",
        type: 'assetManager',
        info: "Add each significant asset of the estate. The calculator will automatically sum the values for the final tax calculation. Do not include exempt assets like a principal residence."
    },
    {
        id: 'otherIncome',
        question: "Enter any other income to be reported on the final tax return.",
        type: 'number',
        field: 'otherFinalIncome',
        info: "This could include final salary payments, business income, or other income accrued before death."
    }
];

function startDeathTaxQuiz() {
    deathTaxQuizStep = 0;
    deathTaxQuizAnswers = { ...calculatorInputs.deathTax };
    deathTaxAssets = []; // Reset asset list

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'deathTaxQuizModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-cookie-cream">
                    <h5 class="modal-title text-cookie-brown"><i class="bi bi-question-circle me-2"></i>Death Tax Assistant</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="quizBody">
                    <div id="quizProgress" class="progress mb-3" style="height: 5px;">
                        <div class="progress-bar bg-cookie-brown" style="width: 0%"></div>
                    </div>
                    <div id="quizContent"></div>
                </div>
                <div class="modal-footer" id="quizFooter"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });

    renderDeathTaxQuizQuestion();
}

function renderDeathTaxQuizQuestion() {
    const question = deathTaxQuizQuestions[deathTaxQuizStep];
    const progress = ((deathTaxQuizStep) / deathTaxQuizQuestions.length) * 100;
    
    document.querySelector('#quizProgress .progress-bar').style.width = `${progress}%`;
    const contentEl = document.getElementById('quizContent');
    
    let html = `<h6 class="text-cookie-brown">${question.question}</h6><p class="small text-muted">${question.info}</p>`;

    switch(question.type) {
        case 'boolean':
            html += `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="quizBoolean" id="quizYes" value="true" ${deathTaxQuizAnswers[question.id] ? 'checked' : ''}>
                    <label class="form-check-label" for="quizYes">Yes</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="quizBoolean" id="quizNo" value="false" ${!deathTaxQuizAnswers[question.id] ? 'checked' : ''}>
                    <label class="form-check-label" for="quizNo">No</label>
                </div>`;
            break;
        case 'number':
            html += `<input type="number" id="quizInput" class="form-control" value="${deathTaxQuizAnswers[question.field] || 0}" placeholder="0.00">`;
            break;
        case 'assetManager':
            html += renderDeathTaxAssetManagerInQuiz();
            break;
    }
    contentEl.innerHTML = html;
    renderDeathTaxQuizFooter();
}

function renderDeathTaxQuizFooter() {
    const footerEl = document.getElementById('quizFooter');
    let footerHtml = `<button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>`;
    if (deathTaxQuizStep > 0) {
        footerHtml += `<button type="button" class="btn btn-outline-cookie-brown btn-sm" onclick="prevDeathTaxQuizQuestion()">Back</button>`;
    }
    if (deathTaxQuizStep < deathTaxQuizQuestions.length - 1) {
        footerHtml += `<button type="button" class="btn btn-cookie-brown btn-sm" onclick="nextDeathTaxQuizQuestion()">Next</button>`;
    } else {
        footerHtml += `<button type="button" class="btn btn-cookie-brown btn-sm" onclick="finishDeathTaxQuiz()">Finish</button>`;
    }
    footerEl.innerHTML = footerHtml;
}

function saveDeathTaxQuizStep() {
    const question = deathTaxQuizQuestions[deathTaxQuizStep];
    switch (question.type) {
        case 'boolean':
            deathTaxQuizAnswers[question.id] = document.getElementById('quizYes').checked;
            break;
        case 'number':
            deathTaxQuizAnswers[question.field] = parseFloat(document.getElementById('quizInput').value) || 0;
            break;
        // Asset manager data is saved directly to its own array, no action needed here.
    }
}

function nextDeathTaxQuizQuestion() {
    saveDeathTaxQuizStep();
    if (deathTaxQuizAnswers.spousalRollover && deathTaxQuizStep === 0) {
        finishDeathTaxQuiz(); // Skip to the end if rollover is chosen
        return;
    }
    if (deathTaxQuizStep < deathTaxQuizQuestions.length - 1) {
        deathTaxQuizStep++;
        renderDeathTaxQuizQuestion();
    }
}

function prevDeathTaxQuizQuestion() {
    saveDeathTaxQuizStep();
    if (deathTaxQuizStep > 0) {
        deathTaxQuizStep--;
        renderDeathTaxQuizQuestion();
    }
}

function renderDeathTaxAssetManagerInQuiz() {
    let assetListHtml = deathTaxAssets.map((asset, index) => {
        return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${asset.name}</strong> (${asset.type})<br>
                    <small class="text-muted">FMV: $${asset.fmv.toLocaleString()}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="removeDeathTaxAsset(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </li>
        `;
    }).join('');

    if (deathTaxAssets.length === 0) {
        assetListHtml = '<p class="text-center text-muted small">No assets added yet.</p>';
    }

    return `
        <div class="card mb-3">
            <div class="card-header py-2">Current Assets</div>
            <ul class="list-group list-group-flush">${assetListHtml}</ul>
        </div>

        <div class="card">
            <div class="card-header py-2">Add New Asset</div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label small">Asset Name</label>
                    <input type="text" id="death-tax-asset-name" class="form-control form-control-sm" placeholder="e.g., Summer Cottage">
                </div>
                <div class="mb-3">
                    <label class="form-label small">Asset Type</label>
                    <select id="death-tax-asset-type" class="form-select form-select-sm" onchange="toggleDeathTaxAssetFields()">
                        <option value="Capital">Capital Property</option>
                        <option value="Depreciable">Depreciable Property</option>
                        <option value="RRSP/RRIF">RRSP/RRIF</option>
                    </select>
                </div>
                <div id="death-tax-fields-capital">
                    <input type="number" id="death-tax-capital-fmv" class="form-control form-control-sm mb-2" placeholder="Fair Market Value (FMV)">
                    <input type="number" id="death-tax-capital-acb" class="form-control form-control-sm" placeholder="Adjusted Cost Base (ACB)">
                </div>
                <div id="death-tax-fields-depreciable" style="display: none;">
                    <input type="number" id="death-tax-depreciable-fmv" class="form-control form-control-sm mb-2" placeholder="Fair Market Value (FMV)">
                    <input type="number" id="death-tax-depreciable-cost" class="form-control form-control-sm mb-2" placeholder="Original Cost">
                    <input type="number" id="death-tax-depreciable-ucc" class="form-control form-control-sm" placeholder="Undepreciated Capital Cost (UCC)">
                </div>
                <div id="death-tax-fields-rrsp" style="display: none;">
                    <input type="number" id="death-tax-rrsp-value" class="form-control form-control-sm" placeholder="Value of Plan">
                </div>
                <button class="btn btn-outline-cookie-brown btn-sm w-100 mt-3" onclick="addDeathTaxAsset()">Add Asset to List</button>
            </div>
        </div>
    `;
}

function toggleDeathTaxAssetFields() {
    const type = document.getElementById('death-tax-asset-type').value;
    document.getElementById('death-tax-fields-capital').style.display = type === 'Capital' ? 'block' : 'none';
    document.getElementById('death-tax-fields-depreciable').style.display = type === 'Depreciable' ? 'block' : 'none';
    document.getElementById('death-tax-fields-rrsp').style.display = type === 'RRSP/RRIF' ? 'block' : 'none';
}

function addDeathTaxAsset() {
    const name = document.getElementById('death-tax-asset-name').value || 'Unnamed Asset';
    const type = document.getElementById('death-tax-asset-type').value;
    let asset = { name, type, fmv: 0, acb: 0, cost: 0, ucc: 0 };

    if (type === 'Capital') {
        asset.fmv = parseFloat(document.getElementById('death-tax-capital-fmv').value) || 0;
        asset.acb = parseFloat(document.getElementById('death-tax-capital-acb').value) || 0;
    } else if (type === 'Depreciable') {
        asset.fmv = parseFloat(document.getElementById('death-tax-depreciable-fmv').value) || 0;
        asset.cost = parseFloat(document.getElementById('death-tax-depreciable-cost').value) || 0;
        asset.ucc = parseFloat(document.getElementById('death-tax-depreciable-ucc').value) || 0;
    } else if (type === 'RRSP/RRIF') {
        asset.fmv = parseFloat(document.getElementById('death-tax-rrsp-value').value) || 0;
    }

    deathTaxAssets.push(asset);
    renderDeathTaxQuizQuestion(); // Re-render the current step to show the new asset
}

function removeDeathTaxAsset(index) {
    deathTaxAssets.splice(index, 1);
    renderDeathTaxQuizQuestion(); // Re-render to update the list
}

function finishDeathTaxQuiz() {
    saveDeathTaxQuizStep(); // Save the final step's data
    
    // Sum up the assets
    calculatorInputs.deathTax = { ...deathTaxQuizAnswers }; // Apply other quiz answers
    calculatorInputs.deathTax.fmvCapitalProperty = deathTaxAssets.filter(a => a.type === 'Capital').reduce((sum, a) => sum + a.fmv, 0);
    calculatorInputs.deathTax.acbCapitalProperty = deathTaxAssets.filter(a => a.type === 'Capital').reduce((sum, a) => sum + a.acb, 0);
    calculatorInputs.deathTax.fmvDepreciableProperty = deathTaxAssets.filter(a => a.type === 'Depreciable').reduce((sum, a) => sum + a.fmv, 0);
    calculatorInputs.deathTax.costDepreciableProperty = deathTaxAssets.filter(a => a.type === 'Depreciable').reduce((sum, a) => sum + a.cost, 0);
    calculatorInputs.deathTax.uccDepreciableProperty = deathTaxAssets.filter(a => a.type === 'Depreciable').reduce((sum, a) => sum + a.ucc, 0);
    calculatorInputs.deathTax.rrspRifValue = deathTaxAssets.filter(a => a.type === 'RRSP/RRIF').reduce((sum, a) => sum + a.fmv, 0);
    
    const modalEl = document.getElementById('deathTaxQuizModal');
    const bsModal = bootstrap.Modal.getInstance(modalEl);
    bsModal.hide();

    loadCalculatorForm('deathTax');
    calculateResults();
}

document.body.insertAdjacentHTML('beforeend', `
<div class="modal fade" id="deathTaxAssistantModal" tabindex="-1" aria-labelledby="deathTaxAssistantModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="deathTaxAssistantModalLabel">Death Tax Assistant</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="deathTaxAssistantModalBody">
        <!-- Asset manager will be rendered here -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-cookie-brown" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-cookie-brown" onclick="finishDeathTaxQuiz()">Apply Assets to Calculator</button>
      </div>
    </div>
  </div>
</div>
`); 