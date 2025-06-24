// Alternative Minimum Tax (AMT) Calculator - Enhanced 2024+ Rules
function calcAmt(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    // Inputs from regular tax return
    const netIncome = parseFloat(input.netIncome) || 0;
    const capitalGains = parseFloat(input.capitalGains) || 0;
    const stockOptionBenefit = parseFloat(input.stockOptionBenefit) || 0;
    const taxShelterLosses = parseFloat(input.taxShelterLosses) || 0;
    const disallowedDeductions = parseFloat(input.disallowedDeductions) || 0;
    const donationCreditsClaimed = parseFloat(input.donationCreditsClaimed) || 0;
    const regularTaxPayable = parseFloat(input.regularTaxPayable) || 0;
    const province = input.province || 'QC'; // Default to QC

    // --- AMT Calculation Steps ---

    // 1. Start with Net Income and add back preferences
    let amtBase = netIncome;
    amtBase += capitalGains; // Add back non-taxable portion
    amtBase += stockOptionBenefit * 0.5; // Add back stock option deduction
    amtBase += taxShelterLosses;
    amtBase += disallowedDeductions;

    // 2. Subtract basic AMT exemption
    const amtExemption = 173205; // For 2024 (Federal and QC harmonized)
    const amtTaxableBase = Math.max(0, amtBase - amtExemption);

    // 3. Calculate gross AMT
    const fedAmtRate = 0.205;
    const grossFederalAmt = amtTaxableBase * fedAmtRate;
    
    let grossProvincialAmt = 0;
    let provincialNetMinimumTax = 0;
    let totalAmt = 0;

    if (province === 'QC') {
        const qcAmtRate = 0.19;
        grossProvincialAmt = amtTaxableBase * qcAmtRate;
    }

    // 4. Deduct allowed non-refundable credits
    const basicPersonalAmount = 15705;
    const basicAmtCredit = basicPersonalAmount * 0.15;
    const otherCreditsAllowed = (donationCreditsClaimed) * 0.5;
    const totalFederalAmtCredits = basicAmtCredit + otherCreditsAllowed;

    // Provincial credits (simplified for QC)
    let totalProvincialAmtCredits = 0;
    if (province === 'QC') {
        const qcBasicPersonalAmount = 18056;
        const qcBasicCredit = qcBasicPersonalAmount * 0.14; // Lowest QC rate
        // Assuming donation credits are the same value provincially
        totalProvincialAmtCredits = qcBasicCredit + otherCreditsAllowed; 
    }
    
    // 5. Calculate Net Minimum Tax
    const federalNetMinimumTax = Math.max(0, grossFederalAmt - totalFederalAmtCredits);
    
    if (province === 'QC') {
        provincialNetMinimumTax = Math.max(0, grossProvincialAmt - totalProvincialAmtCredits);
    }

    // 6. Apply Quebec Abatement to Federal Tax
    const quebecAbatement = province === 'QC' ? federalNetMinimumTax * 0.165 : 0;
    const finalFederalNetMinimumTax = federalNetMinimumTax - quebecAbatement;

    // 7. Total Minimum Tax
    const netMinimumTax = finalFederalNetMinimumTax + provincialNetMinimumTax;
    
    // 8. Compare with regular tax
    const amtPayable = Math.max(0, netMinimumTax - regularTaxPayable);
    const minimumTaxCarryover = amtPayable;
    const combinedRate = (fedAmtRate * (1 - (province === 'QC' ? 0.165 : 0))) + (province === 'QC' ? 0.19 : 0);

    return {
        province: province,
        amtBase,
        amtExemption,
        amtTaxableBase,
        
        grossFederalAmt,
        totalFederalAmtCredits,
        federalNetMinimumTax,
        quebecAbatement,
        finalFederalNetMinimumTax,

        grossProvincialAmt,
        totalProvincialAmtCredits,
        provincialNetMinimumTax,
        
        netMinimumTax,
        regularTaxPayable,
        amtPayable,
        minimumTaxCarryover,
        
        effectiveCombinedRate: combinedRate
    };
}

// Global variables for the AMT quiz
let amtQuizStep = 0;
let amtQuizAnswers = {};

// Enhanced AMT form loader
function loadAmtForm(container) {
    const headerActions = document.getElementById('inputFormHeaderActions');
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm" onclick="startAmtQuiz()">
            <i class="bi bi-question-circle"></i>
            <span class="d-none d-md-inline">Assistant</span>
        </button>
    `;

    container.innerHTML = '';
    container.className = 'fade-in';

    const inputs = calculatorInputs.amt;

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

    const addSelectRow = (label, key, options, description) => {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.innerHTML = `${label}<br/><small class="text-muted">${description}</small>`;
        tr.appendChild(tdLabel);

        const tdInput = document.createElement('td');
        const selectEl = document.createElement('select');
        selectEl.className = 'form-select form-select-sm';
        selectEl.onchange = () => updateInput('amt', key, selectEl);
        
        options.forEach(opt => {
            const optionEl = document.createElement('option');
            optionEl.value = opt.value;
            optionEl.textContent = opt.label;
            if (inputs[key] === opt.value) {
                optionEl.selected = true;
            }
            selectEl.appendChild(optionEl);
        });

        tdInput.appendChild(selectEl);
        tr.appendChild(tdInput);
        tbody.appendChild(tr);
    };

    const addInputRow = (label, key, description) => {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.innerHTML = `${label}<br/><small class="text-muted">${description}</small>`;
        tr.appendChild(tdLabel);

        const tdInput = document.createElement('td');
        const inputEl = document.createElement('input');
        inputEl.type = 'number';
        inputEl.value = inputs[key] || 0;
        inputEl.min = '0';
        inputEl.step = '0.01';
        inputEl.className = 'form-control form-control-sm text-end';
        inputEl.onchange = () => updateInput('amt', key, inputEl);
        tdInput.appendChild(inputEl);
        tr.appendChild(tdInput);
        tbody.appendChild(tr);
    };

    addSectionHeader('Jurisdiction');
    addSelectRow('Province', 'province', [
        { value: 'QC', label: 'Quebec' },
        { value: 'FED', label: 'Federal Only' }
    ], 'Select province to include provincial AMT.');

    addSectionHeader('Regular Tax Information');
    addInputRow('Regular Net Income (Line 23600)', 'netIncome', 'Start with your standard net income.');
    addInputRow('Regular Federal Tax Payable', 'regularTaxPayable', 'The final federal tax from your regular calculation.');

    addSectionHeader('AMT Preference Items');
    addInputRow('Taxable Capital Gains (Line 12700)', 'capitalGains', 'The 50% taxable portion. AMT includes 100%.');
    addInputRow('Stock Option Benefit (Line 10100)', 'stockOptionBenefit', 'The employment benefit from stock options.');
    addInputRow('Tax Shelter Losses Claimed', 'taxShelterLosses', 'Losses from partnerships or tax shelters.');
    addInputRow('Other Disallowed Deductions', 'disallowedDeductions', 'e.g., carrying charges, moving/child care expenses.');

    addSectionHeader('Non-Refundable Credits');
    addInputRow('Total Donation Credits Claimed', 'donationCreditsClaimed', 'The value of federal donation credits.');

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// --- Quiz Logic for AMT ---

const amtQuizQuestions = [
    {
        id: 'start',
        question: "Let's calculate your Adjusted Taxable Income for AMT. Start with your Net Income for tax purposes (Line 23600).",
        type: 'number',
        field: 'netIncome',
        info: "This is your total income minus various deductions."
    },
    {
        id: 'capitalGains',
        question: "Enter the 'taxable' capital gains you reported (50% of your actual gain).",
        type: 'number',
        field: 'capitalGains',
        info: "For AMT, 100% of the capital gain is included. The calculator will automatically add the other 50%."
    },
    {
        id: 'stockOptions',
        question: "Enter the total stock option benefit you received.",
        type: 'number',
        field: 'stockOptionBenefit',
        info: "For regular tax, you can deduct 50% of this benefit. For AMT, this deduction is not allowed, so it's added back to income."
    },
    {
        id: 'otherAdjustments',
        question: "Enter the total of other less-common deductions to be added back.",
        type: 'multi-number',
        fields: [
            { id: 'taxShelterLosses', label: 'Tax Shelter & Partnership Losses' },
            { id: 'disallowedDeductions', label: 'Other Deductions (e.g., carrying charges)' }
        ],
        info: "Many deductions allowed for regular tax are disallowed for AMT."
    },
    {
        id: 'credits',
        question: "What was the total value of your federal non-refundable tax credits for donations?",
        type: 'number',
        field: 'donationCreditsClaimed',
        info: "For AMT, only 50% of most non-refundable credits are allowed. The Basic Personal Amount is still fully allowed."
    },
    {
        id: 'regularTax',
        question: "Finally, what was your regular federal tax payable, *before* considering AMT?",
        type: 'number',
        field: 'regularTaxPayable',
        info: "The AMT payable is the excess of the minimum tax over this regular tax amount."
    }
];

function startAmtQuiz() {
    amtQuizStep = 0;
    amtQuizAnswers = { ...calculatorInputs.amt };

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'amtQuizModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-cookie-cream">
                    <h5 class="modal-title text-cookie-brown"><i class="bi bi-question-circle me-2"></i>AMT Quiz (T691)</h5>
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

    renderAmtQuizQuestion();
}

function renderAmtQuizQuestion() {
    const question = amtQuizQuestions[amtQuizStep];
    const progress = ((amtQuizStep) / amtQuizQuestions.length) * 100;
    
    document.querySelector('#quizProgress .progress-bar').style.width = `${progress}%`;
    const contentEl = document.getElementById('quizContent');
    const footerEl = document.getElementById('quizFooter');
    
    let html = `<h6 class="text-cookie-brown">${question.question}</h6><p class="small text-muted">${question.info}</p>`;

    switch(question.type) {
        case 'number':
            html += `<input type="number" id="quizInput" class="form-control" value="${amtQuizAnswers[question.field] || 0}" placeholder="0.00">`;
            break;
        case 'multi-number':
            html += question.fields.map(f => `
                <div class="mb-2">
                    <label class="form-label small">${f.label}</label>
                    <input type="number" id="quizInput_${f.id}" class="form-control" value="${amtQuizAnswers[f.id] || 0}" placeholder="0.00">
                </div>
            `).join('');
            break;
    }
    contentEl.innerHTML = html;

    let footerHtml = `<button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>`;
    if (amtQuizStep > 0) {
        footerHtml += `<button type="button" class="btn btn-outline-cookie-brown btn-sm" onclick="prevAmtQuizQuestion()">Back</button>`;
    }
    if (amtQuizStep < amtQuizQuestions.length - 1) {
        footerHtml += `<button type="button" class="btn btn-cookie-brown btn-sm" onclick="nextAmtQuizQuestion()">Next</button>`;
    } else {
        footerHtml += `<button type="button" class="btn btn-cookie-brown btn-sm" onclick="finishAmtQuiz()">Finish</button>`;
    }
    footerEl.innerHTML = footerHtml;
}

function saveAmtQuizStep() {
    const question = amtQuizQuestions[amtQuizStep];
    switch (question.type) {
        case 'number':
            amtQuizAnswers[question.field] = parseFloat(document.getElementById('quizInput').value) || 0;
            break;
        case 'multi-number':
            question.fields.forEach(f => {
                amtQuizAnswers[f.id] = parseFloat(document.getElementById(`quizInput_${f.id}`).value) || 0;
            });
            break;
    }
}

function nextAmtQuizQuestion() {
    saveAmtQuizStep();
    if (amtQuizStep < amtQuizQuestions.length - 1) {
        amtQuizStep++;
        renderAmtQuizQuestion();
    }
}

function prevAmtQuizQuestion() {
    saveAmtQuizStep();
    if (amtQuizStep > 0) {
        amtQuizStep--;
        renderAmtQuizQuestion();
    }
}

function finishAmtQuiz() {
    saveAmtQuizStep();
    calculatorInputs.amt = { ...amtQuizAnswers };
    
    const modalEl = document.getElementById('amtQuizModal');
    if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        bsModal.hide();
    }

    loadCalculatorForm('amt');
    calculateResults();
} 