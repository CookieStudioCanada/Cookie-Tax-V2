// Departure Tax Calculator - Enhanced Structure
function calcDepartureTax(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    // Inputs
    const fmvNonTcp = parseFloat(input.fmvNonTcp) || 0;
    const acbNonTcp = parseFloat(input.acbNonTcp) || 0;
    const otherIncome = parseFloat(input.otherIncome) || 0;
    const electToDefer = input.electToDefer || false;
    const province = input.province || 'QC';

    // Deemed disposition calculation
    const capitalGain = Math.max(0, fmvNonTcp - acbNonTcp);
    const taxableCapitalGain = capitalGain * 0.5;

    const totalIncome = otherIncome + taxableCapitalGain;

    // Tax calculation using progressive rates
    // This assumes taxRates is globally available from app.js
    const federalTax = calculateTaxOnIncome(totalIncome, taxRates.fed);
    
    let provincialTax, quebecAbatement = 0;
    if (province === 'QC') {
        provincialTax = calculateTaxOnIncome(totalIncome, taxRates.qc);
        quebecAbatement = federalTax * 0.165;
    } else {
        provincialTax = 0; // Placeholder for other provinces
    }

    // Basic personal credits (non-prorated for simplicity)
    const federalBasicCredit = (taxRates.fed[0].max * taxRates.fed[0].rate) > 15000 ? 15000 * 0.15 : (taxRates.fed[0].max * taxRates.fed[0].rate);
    const provincialBasicCredit = province === 'QC' ? 16143 * 0.14 : 0;
    
    const netFederalTax = Math.max(0, federalTax - federalBasicCredit - quebecAbatement);
    const netProvincialTax = Math.max(0, provincialTax - provincialBasicCredit);
    const totalTax = netFederalTax + netProvincialTax;
    
    // Approximate departure tax component
    const taxOnOtherIncome = calculateTaxOnIncome(otherIncome, taxRates.fed) + (province === 'QC' ? calculateTaxOnIncome(otherIncome, taxRates.qc) : 0);
    const departureTaxLiability = Math.max(0, totalTax - taxOnOtherIncome);

    return {
        capitalGain: capitalGain,
        taxableCapitalGain: taxableCapitalGain,
        totalIncomeInYearOfDeparture: totalIncome,
        departureTaxLiability: departureTaxLiability,
        taxDeferred: electToDefer ? departureTaxLiability : 0,
        securityRequired: electToDefer,
        note: electToDefer ? 'Security must be posted with CRA for the deferred amount.' : 'Tax is due with the final Canadian tax return.'
    };
}

// Helper function (can be removed if globally available)
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

// Global variables for the Departure Tax quiz
let departureTaxQuizStep = 0;
let departureTaxQuizAnswers = {};
let departureTaxAssets = [];

// Enhanced Departure Tax form loader
function loadDepartureTaxForm(container) {
    const headerActions = document.getElementById('inputFormHeaderActions');
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm" onclick="startDepartureTaxQuiz()">
            <i class="bi bi-question-circle"></i>
            <span class="d-none d-md-inline">Assistant</span>
        </button>
    `;

    container.innerHTML = '';
    container.className = 'fade-in';

    const inputs = calculatorInputs.departureTax;

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

    const addInfoRow = (label, value) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="2"><small class="text-muted">${label}: ${value}</small></td>`;
        tbody.appendChild(tr);
    };

    const addInputRow = (label, key, isCheckbox = false) => {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.textContent = label;
        tr.appendChild(tdLabel);

        const tdInput = document.createElement('td');
        if (isCheckbox) {
            const checkboxEl = document.createElement('input');
            checkboxEl.type = 'checkbox';
            checkboxEl.checked = inputs[key] || false;
            checkboxEl.className = 'form-check-input';
            checkboxEl.onchange = () => updateInput('departureTax', key, checkboxEl);
            tdInput.appendChild(checkboxEl);
        } else {
            const inputEl = document.createElement('input');
            inputEl.type = 'number';
            inputEl.value = inputs[key] || 0;
            inputEl.min = '0';
            inputEl.step = '0.01';
            inputEl.className = 'form-control form-control-sm text-end';
            inputEl.onchange = () => updateInput('departureTax', key, inputEl);
            tdInput.appendChild(inputEl);
        }
        tr.appendChild(tdInput);
        tbody.appendChild(tr);
    };

    addSectionHeader('Deemed Disposition (s.128.1)');
    addInfoRow('Note', 'Taxable Canadian Property (e.g., Canadian real estate) and registered plans (RRSP, etc.) are generally exempt from departure tax.');
    addInputRow('FMV of Property Subject to Deemed Disposition', 'fmvNonTcp');
    addInputRow('ACB of Property Subject to Deemed Disposition', 'acbNonTcp');
    
    addSectionHeader('Other Income');
    addInputRow('Other income in year of departure', 'otherIncome');

    addSectionHeader('Election to Defer (s.220(4.5))');
    addInputRow('Elect to defer payment of departure tax?', 'electToDefer', true);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// --- Re-integrated Quiz Logic for Departure Tax ---

const departureTaxQuizQuestions = [
    {
        id: 'manageAssets',
        question: "Manage Assets Subject to Departure Tax",
        type: 'assetManager',
        info: "Add each asset subject to the deemed disposition rule (e.g., foreign stocks, personal use property). Do NOT include exempt assets like Canadian real estate or RRSPs."
    },
    {
        id: 'otherIncome',
        question: "Enter any other income to be reported in the year of departure.",
        type: 'number',
        field: 'otherIncome',
        info: "This could include final salary payments, business income, etc., earned while still a resident of Canada."
    },
    {
        id: 'electToDefer',
        question: "Do you want to elect to defer the payment of the departure tax by posting security with the CRA?",
        type: 'boolean',
        info: "This allows you to pay the tax later, but requires arranging security with the CRA for the amount owing."
    }
];

function startDepartureTaxQuiz() {
    departureTaxQuizStep = 0;
    departureTaxQuizAnswers = { ...calculatorInputs.departureTax };
    departureTaxAssets = [];

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'departureTaxQuizModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-cookie-cream">
                    <h5 class="modal-title text-cookie-brown"><i class="bi bi-question-circle me-2"></i>Departure Tax Assistant</h5>
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

    renderDepartureTaxQuizQuestion();
}

function renderDepartureTaxQuizQuestion() {
    const question = departureTaxQuizQuestions[departureTaxQuizStep];
    const progress = ((departureTaxQuizStep) / departureTaxQuizQuestions.length) * 100;
    
    document.querySelector('#quizProgress .progress-bar').style.width = `${progress}%`;
    const contentEl = document.getElementById('quizContent');
    
    let html = `<h6 class="text-cookie-brown">${question.question}</h6><p class="small text-muted">${question.info}</p>`;

    switch(question.type) {
        case 'boolean':
            html += `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="quizBoolean" id="quizYes" value="true" ${departureTaxQuizAnswers[question.id] ? 'checked' : ''}>
                    <label class="form-check-label" for="quizYes">Yes</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="quizBoolean" id="quizNo" value="false" ${!departureTaxQuizAnswers[question.id] ? 'checked' : ''}>
                    <label class="form-check-label" for="quizNo">No</label>
                </div>`;
            break;
        case 'number':
            html += `<input type="number" id="quizInput" class="form-control" value="${departureTaxQuizAnswers[question.field] || 0}" placeholder="0.00">`;
            break;
        case 'assetManager':
            html += renderDepartureTaxAssetManagerInQuiz();
            break;
    }
    contentEl.innerHTML = html;
    renderDepartureTaxQuizFooter();
}

function renderDepartureTaxQuizFooter() {
    const footerEl = document.getElementById('quizFooter');
    let footerHtml = `<button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>`;
    if (departureTaxQuizStep > 0) {
        footerHtml += `<button type="button" class="btn btn-outline-cookie-brown btn-sm" onclick="prevDepartureTaxQuizQuestion()">Back</button>`;
    }
    if (departureTaxQuizStep < departureTaxQuizQuestions.length - 1) {
        footerHtml += `<button type="button" class="btn btn-cookie-brown btn-sm" onclick="nextDepartureTaxQuizQuestion()">Next</button>`;
    } else {
        footerHtml += `<button type="button" class="btn btn-cookie-brown btn-sm" onclick="finishDepartureTaxQuiz()">Finish</button>`;
    }
    footerEl.innerHTML = footerHtml;
}

function saveDepartureTaxQuizStep() {
    const question = departureTaxQuizQuestions[departureTaxQuizStep];
    switch (question.type) {
        case 'boolean':
            departureTaxQuizAnswers[question.id] = document.getElementById('quizYes').checked;
            break;
        case 'number':
            departureTaxQuizAnswers[question.field] = parseFloat(document.getElementById('quizInput').value) || 0;
            break;
    }
}

function nextDepartureTaxQuizQuestion() {
    saveDepartureTaxQuizStep();
    if (departureTaxQuizStep < departureTaxQuizQuestions.length - 1) {
        departureTaxQuizStep++;
        renderDepartureTaxQuizQuestion();
    }
}

function prevDepartureTaxQuizQuestion() {
    saveDepartureTaxQuizStep();
    if (departureTaxQuizStep > 0) {
        departureTaxQuizStep--;
        renderDepartureTaxQuizQuestion();
    }
}

function renderDepartureTaxAssetManagerInQuiz() {
    let assetListHtml = departureTaxAssets.map((asset, index) => {
        return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${asset.name}</strong><br>
                    <small class="text-muted">FMV: $${asset.fmv.toLocaleString()}, ACB: $${asset.acb.toLocaleString()}</small>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="removeDepartureTaxAsset(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </li>
        `;
    }).join('');

    if (departureTaxAssets.length === 0) {
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
                <input type="text" id="departure-tax-asset-name" class="form-control form-control-sm mb-2" placeholder="Asset Name (e.g., US Stock Portfolio)">
                <div class="row">
                    <div class="col-md-6">
                        <input type="number" id="departure-tax-asset-fmv" class="form-control form-control-sm" placeholder="Fair Market Value (FMV)">
                    </div>
                    <div class="col-md-6">
                        <input type="number" id="departure-tax-asset-acb" class="form-control form-control-sm" placeholder="Adjusted Cost Base (ACB)">
                    </div>
                </div>
                <button class="btn btn-outline-cookie-brown btn-sm w-100 mt-3" onclick="addDepartureTaxAsset()">Add Asset to List</button>
            </div>
        </div>
    `;
}

function addDepartureTaxAsset() {
    const name = document.getElementById('departure-tax-asset-name').value || 'Unnamed Asset';
    const fmv = parseFloat(document.getElementById('departure-tax-asset-fmv').value) || 0;
    const acb = parseFloat(document.getElementById('departure-tax-asset-acb').value) || 0;
    
    departureTaxAssets.push({ name, fmv, acb });
    renderDepartureTaxQuizQuestion(); // Re-render the list
}

function removeDepartureTaxAsset(index) {
    departureTaxAssets.splice(index, 1);
    renderDepartureTaxQuizQuestion();
}

function finishDepartureTaxQuiz() {
    saveDepartureTaxQuizStep();

    // Sum up the assets
    calculatorInputs.departureTax = { ...departureTaxQuizAnswers };
    calculatorInputs.departureTax.fmvNonTcp = departureTaxAssets.reduce((sum, asset) => sum + asset.fmv, 0);
    calculatorInputs.departureTax.acbNonTcp = departureTaxAssets.reduce((sum, asset) => sum + asset.acb, 0);
    
    // Close the modal and update the main form
    const modalEl = document.getElementById('departureTaxQuizModal');
    const bsModal = bootstrap.Modal.getInstance(modalEl);
    bsModal.hide();

    loadCalculatorForm('departureTax');
    calculateResults();
}

document.body.insertAdjacentHTML('beforeend', `
<div class="modal fade" id="departureTaxAssistantModal" tabindex="-1" aria-labelledby="departureTaxAssistantModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="departureTaxAssistantModalLabel">Departure Tax Assistant</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="departureTaxAssistantModalBody">
        <!-- Asset manager will be rendered here -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-cookie-brown" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-cookie-brown" onclick="finishDepartureTaxQuiz()">Apply Assets to Calculator</button>
      </div>
    </div>
  </div>
</div>
`); 