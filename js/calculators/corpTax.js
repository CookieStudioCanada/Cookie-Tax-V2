// Corporate Tax Calculator - Enhanced T2 Structure
function calcCorpTax(input) {
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    // Income inputs
    const activeBusinessIncome = parseFloat(input.activeBusinessIncome) || 0;
    const investmentIncome = parseFloat(input.investmentIncome) || 0;
    const foreignIncome = parseFloat(input.foreignIncome) || 0;
    const otherIncome = parseFloat(input.otherIncome) || 0;
    const capitalGains = parseFloat(input.capitalGains) || 0;
    
    // Deductions
    const businessDeductions = parseFloat(input.businessDeductions) || 0;
    const cca = parseFloat(input.cca) || 0; // Capital Cost Allowance
    const interestExpense = parseFloat(input.interestExpense) || 0;
    const otherDeductions = parseFloat(input.otherDeductions) || 0;
    
    // SBD eligibility
    const sbdEligibility = parseFloat(input.sbdEligibility) || 100;
    const associatedCorporations = input.associatedCorporations || false;
    const passiveIncome = parseFloat(input.passiveIncome) || 0;
    
    // Previous balances
    const rdtohEligible = parseFloat(input.rdtohEligible) || 0;
    const rdtohNonEligible = parseFloat(input.rdtohNonEligible) || 0;
    const grip = parseFloat(input.grip) || 0;
    const lrip = parseFloat(input.lrip) || 0;
    const cda = parseFloat(input.cda) || 0;
    
    const province = input.province || 'QC';

    // Calculate total income
    const taxableCapitalGains = capitalGains * 0.5;
    const totalIncome = activeBusinessIncome + investmentIncome + foreignIncome + 
                       otherIncome + taxableCapitalGains;
    
    // Calculate total deductions
    const totalDeductions = businessDeductions + cca + interestExpense + otherDeductions;
    
    // Calculate net income for tax purposes
    const netIncome = Math.max(0, totalIncome - totalDeductions);
    const taxableIncome = netIncome;
    
    // Calculate SBD eligible income (max $500,000, reduced by passive income)
    const sbdLimit = Math.max(0, 500000 - ((passiveIncome - 50000) * 5)); // Grind starts after $50k passive income
    const sbdEligibleIncome = Math.min(
        activeBusinessIncome, // SBD is only on Active Business Income
        sbdLimit,
        taxableIncome
    );
    
    // Allocate taxable income
    const investmentIncomeTaxable = Math.min(investmentIncome, Math.max(0, taxableIncome - sbdEligibleIncome));
    const generalRateIncome = Math.max(0, taxableIncome - sbdEligibleIncome - investmentIncomeTaxable);

    // Get rates from global object
    const rates = taxRates.corp;
    const fedRates = rates.fed;
    const provRates = rates[province.toLowerCase()] || rates.qc; // Default to QC if province not found

    // Calculate taxes
    const federalSBDTax = sbdEligibleIncome * fedRates.sbd;
    const federalGeneralTax = generalRateIncome * fedRates.general;

    // Part I tax on investment income
    const federalInvestmentTax = investmentIncomeTaxable * fedRates.investment;
    const refundablePortionFederal = investmentIncomeTaxable * fedRates.investmentRefundable;
    
    const provincialSBDTax = sbdEligibleIncome * provRates.sbd;
    const provincialGeneralTax = generalRateIncome * provRates.general;
    const provincialInvestmentTax = investmentIncomeTaxable * provRates.investment;

    const totalFederalTax = federalSBDTax + federalGeneralTax + federalInvestmentTax;
    const totalProvincialTax = provincialSBDTax + provincialGeneralTax + provincialInvestmentTax;
    const totalTax = totalFederalTax + totalProvincialTax;

    // Refundable tax calculations
    // No provincial refundable tax in this model
    const totalRefundableTax = refundablePortionFederal;
    
    // RDTOH calculations
    // Part IV tax would also be added here, but is not in this calculator.
    // All of refundable Part I tax creates eRDTOH for a CCPC.
    const rdtohEligibleAddition = refundablePortionFederal;
    const rdtohNonEligibleAddition = 0; // nRDTOH comes from eligible dividends received, not part of this calc.
    const newRdtohEligible = rdtohEligible + rdtohEligibleAddition;
    const newRdtohNonEligible = rdtohNonEligible + rdtohNonEligibleAddition;

    // GRIP calculation (General Rate Income Pool)
    // Simplified: Taxable income not subject to SBD, adjusted for tax.
    const gripAddition = (generalRateIncome + investmentIncomeTaxable) * (1 - fedRates.general); // Simplified formula
    const newGrip = grip + gripAddition;
    
    // LRIP is deprecated, CDA is handled separately.
    const lripAddition = 0;
    const newLrip = lrip;
    
    // CDA calculation
    const cdaAddition = capitalGains * 0.5; // Non-taxable portion
    const newCda = cda + cdaAddition;

    // Combined tax rates
    const combinedSBDRate = fedRates.sbd + provRates.sbd;
    const combinedGeneralRate = fedRates.general + provRates.general;
    // Investment income is more complex due to refundability.
    const combinedInvestmentRate = (fedRates.investment + provRates.investment);
    const effectiveInvestmentRate = (combinedInvestmentRate * investmentIncomeTaxable - refundablePortionFederal) / investmentIncomeTaxable;

    // After-tax calculations
    const afterTaxIncome = taxableIncome - totalTax;
    const effectiveTaxRate = taxableIncome > 0 ? totalTax / taxableIncome : 0;

    return {
        // Income
        activeBusinessIncome: activeBusinessIncome,
        investmentIncome: investmentIncome,
        foreignIncome: foreignIncome,
        otherIncome: otherIncome,
        capitalGains: capitalGains,
        taxableCapitalGains: taxableCapitalGains,
        totalIncome: totalIncome,
        
        // Deductions
        businessDeductions: businessDeductions,
        cca: cca,
        interestExpense: interestExpense,
        otherDeductions: otherDeductions,
        totalDeductions: totalDeductions,
        
        // Taxable income and allocation
        netIncome: netIncome,
        taxableIncome: taxableIncome,
        sbdEligibleIncome: sbdEligibleIncome,
        generalRateIncome: generalRateIncome,
        investmentIncomeTaxable: investmentIncomeTaxable,
        sbdLimit: sbdLimit,
        
        // Tax calculations
        federalSBDTax: federalSBDTax,
        federalGeneralTax: federalGeneralTax,
        federalInvestmentTax: federalInvestmentTax,
        totalFederalTax: totalFederalTax,
        provincialSBDTax: provincialSBDTax,
        provincialGeneralTax: provincialGeneralTax,
        provincialInvestmentTax: provincialInvestmentTax,
        totalProvincialTax: totalProvincialTax,
        totalTax: totalTax,
        
        // Refundable taxes
        refundablePortionFederal: refundablePortionFederal,
        totalRefundableTax: totalRefundableTax,
        
        // Account balances
        rdtohEligible: rdtohEligible,
        rdtohNonEligible: rdtohNonEligible,
        rdtohEligibleAddition: rdtohEligibleAddition,
        rdtohNonEligibleAddition: rdtohNonEligibleAddition,
        newRdtohEligible: newRdtohEligible,
        newRdtohNonEligible: newRdtohNonEligible,
        gripAddition: gripAddition,
        lripAddition: lripAddition,
        newGrip: newGrip,
        newLrip: newLrip,
        cdaAddition: cdaAddition,
        newCda: newCda,
        
        // Rates and summary
        combinedSBDRate: combinedSBDRate,
        combinedGeneralRate: combinedGeneralRate,
        combinedInvestmentRate: combinedInvestmentRate,
        effectiveInvestmentRate: effectiveInvestmentRate,
        effectiveTaxRate: effectiveTaxRate,
        afterTaxIncome: afterTaxIncome
    };
}

// Enhanced Corporate Tax form loader
function loadCorpTaxForm(container) {
    const headerActions = document.getElementById('inputFormHeaderActions');
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm" onclick="startT2Quiz()">
            <i class="bi bi-question-circle"></i>
            <span class="d-none d-md-inline">Assistant</span>
        </button>
    `;

    container.innerHTML = '';
    container.className = 'fade-in';

    const inputs = calculatorInputs.corpTax;

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

    const addInputRow = (label, key, lineNumber = null) => {
        const tr = document.createElement('tr');
        const inputEl = document.createElement('input');
        inputEl.type = 'number';
        inputEl.value = inputs[key] || 0;
        inputEl.min = '0';
        inputEl.step = '0.01';
        inputEl.className = 'form-control form-control-sm text-end';
        inputEl.onchange = (e) => updateInput('corpTax', key, inputEl);
        const tdLabel = document.createElement('td');
        tdLabel.innerHTML = `${lineNumber ? `<small class="text-muted">${lineNumber}</small> ` : ''}${label}`;
        const tdInput = document.createElement('td');
        tdInput.appendChild(inputEl);
        tr.appendChild(tdLabel);
        tr.appendChild(tdInput);
        tbody.appendChild(tr);
    };

    // Income section - T2 Schedule 1
    addSectionHeader('Income (T2 Schedule 1)');
    addInputRow('Active business income', 'activeBusinessIncome', '400');
    addInputRow('Investment income', 'investmentIncome', '410');
    addInputRow('Taxable capital gains', 'capitalGains', '420');
    addInputRow('Foreign income', 'foreignIncome', '430');
    addInputRow('Other income', 'otherIncome', '440');

    // Total Income calculation row
    const totalIncomeRow = document.createElement('tr');
    totalIncomeRow.className = 'table-warning';
    totalIncomeRow.innerHTML = `
        <td><strong>Total Income (Line 500)</strong></td>
        <td class="text-end"><strong id="corpTotalIncomeDisplay">$0.00</strong></td>
    `;
    tbody.appendChild(totalIncomeRow);

    // Deductions section - T2 Schedule 1
    addSectionHeader('Deductions (T2 Schedule 1)');
    addInputRow('Business deductions', 'businessDeductions', '600');
    addInputRow('Capital cost allowance (CCA)', 'cca', '700');
    addInputRow('Interest expense', 'interestExpense', '710');
    addInputRow('Other deductions', 'otherDeductions', '800');

    // Total Deductions calculation row
    const totalDeductionsRow = document.createElement('tr');
    totalDeductionsRow.className = 'table-warning';
    totalDeductionsRow.innerHTML = `
        <td><strong>Total Deductions (Line 900)</strong></td>
        <td class="text-end"><strong id="corpTotalDeductionsDisplay">$0.00</strong></td>
    `;
    tbody.appendChild(totalDeductionsRow);

    // SBD Configuration
    addSectionHeader('Small Business Deduction');
    addInputRow('SBD eligibility %', 'sbdEligibility', 'SBD');
    addInputRow('Passive income', 'passiveIncome', '');

    // Account Balances
    addSectionHeader('Previous Account Balances');
    addInputRow('RDTOH - Eligible', 'rdtohEligible', 'RDTOH-E');
    addInputRow('RDTOH - Non-eligible', 'rdtohNonEligible', 'RDTOH-NE');
    addInputRow('GRIP balance', 'grip', 'GRIP');
    addInputRow('LRIP balance', 'lrip', 'LRIP');
    addInputRow('CDA balance', 'cda', 'CDA');

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);

    // Add event listeners to update totals
    updateCorpTotalsDisplay();
}

// Function to update corporate totals display
function updateCorpTotalsDisplay() {
    const inputs = calculatorInputs.corpTax;
    
    // Calculate total income
    const activeBusinessIncome = parseFloat(inputs.activeBusinessIncome) || 0;
    const investmentIncome = parseFloat(inputs.investmentIncome) || 0;
    const capitalGains = parseFloat(inputs.capitalGains) || 0;
    const foreignIncome = parseFloat(inputs.foreignIncome) || 0;
    const otherIncome = parseFloat(inputs.otherIncome) || 0;
    
    const taxableCapitalGains = capitalGains * 0.5;
    const totalIncome = activeBusinessIncome + investmentIncome + foreignIncome + 
                       otherIncome + taxableCapitalGains;
    
    // Calculate total deductions
    const businessDeductions = parseFloat(inputs.businessDeductions) || 0;
    const cca = parseFloat(inputs.cca) || 0;
    const interestExpense = parseFloat(inputs.interestExpense) || 0;
    const otherDeductions = parseFloat(inputs.otherDeductions) || 0;
    
    const totalDeductions = businessDeductions + cca + interestExpense + otherDeductions;
    
    // Update displays
    const totalIncomeEl = document.getElementById('corpTotalIncomeDisplay');
    const totalDeductionsEl = document.getElementById('corpTotalDeductionsDisplay');
    
    if (totalIncomeEl) {
        totalIncomeEl.textContent = `$${totalIncome.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (totalDeductionsEl) {
        totalDeductionsEl.textContent = `$${totalDeductions.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}

// T2 Quiz Assistant
let t2QuizStep = 0;
let t2QuizAnswers = {};

const t2QuizQuestions = [
    {
        id: 'income',
        question: "Let's start with income. Enter the main sources of income for the corporation.",
        type: 'multi-number',
        fields: [
            { id: 'activeBusinessIncome', label: 'Active Business Income (e.g., from sales)' },
            { id: 'investmentIncome', label: 'Investment Income (e.g., interest, rent)' },
            { id: 'capitalGains', label: 'Total Capital Gains (not taxable portion)' }
        ],
        info: "This quiz uses a simplified T2 structure."
    },
    {
        id: 'deductions',
        question: "Now, enter any business deductions.",
        type: 'multi-number',
        fields: [
            { id: 'cca', label: 'Capital Cost Allowance (CCA)' },
            { id: 'interestExpense', label: 'Interest Expense' },
            { id: 'otherDeductions', label: 'Other Business Deductions' }
        ],
        info: "These are expenses incurred to earn income."
    },
    {
        id: 'sbd',
        question: "To determine the Small Business Deduction (SBD), we need details on passive income.",
        type: 'number',
        field: 'passiveIncome',
        info: "Enter the 'Adjusted Aggregate Investment Income' (essentially passive income) for the corporation and any associated corporations. The $500,000 SBD limit is reduced if this amount is over $50,000."
    },
    {
        id: 'balances',
        question: "Finally, enter the opening balances of key tax accounts.",
        type: 'multi-number',
        fields: [
            { id: 'rdtohEligible', label: 'Eligible RDTOH' },
            { id: 'rdtohNonEligible', label: 'Non-Eligible RDTOH' },
            { id: 'grip', label: 'GRIP (General Rate Income Pool)' },
            { id: 'cda', label: 'CDA (Capital Dividend Account)' }
        ],
        info: "These balances determine the type of dividends that can be paid to shareholders."
    }
];

function startT2Quiz() {
    t2QuizStep = 0;
    t2QuizAnswers = { ...calculatorInputs.corpTax };

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 't2QuizModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-cookie-cream">
                    <h5 class="modal-title text-cookie-brown"><i class="bi bi-question-circle me-2"></i>Corporate Tax (T2) Quiz</h5>
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

    renderT2QuizQuestion();
}

function renderT2QuizQuestion() {
    const question = t2QuizQuestions[t2QuizStep];
    const progress = ((t2QuizStep) / t2QuizQuestions.length) * 100;
    
    document.querySelector('#quizProgress .progress-bar').style.width = `${progress}%`;
    const contentEl = document.getElementById('quizContent');
    const footerEl = document.getElementById('quizFooter');
    
    let html = `<h6 class="text-cookie-brown">${question.question}</h6><p class="small text-muted">${question.info}</p>`;

    switch(question.type) {
        case 'number':
            html += `<input type="number" id="quizInput" class="form-control" value="${t2QuizAnswers[question.field] || 0}" placeholder="0.00">`;
            break;
        case 'multi-number':
            html += question.fields.map(f => `
                <div class="mb-2">
                    <label class="form-label small">${f.label}</label>
                    <input type="number" id="quizInput_${f.id}" class="form-control" value="${t2QuizAnswers[f.id] || 0}" placeholder="0.00">
                </div>
            `).join('');
            break;
    }
    contentEl.innerHTML = html;

    let footerHtml = `<button type="button" class="btn btn-outline-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>`;
    if (t2QuizStep > 0) {
        footerHtml += `<button type="button" class="btn btn-outline-cookie-brown btn-sm" onclick="prevT2QuizQuestion()">Back</button>`;
    }
    if (t2QuizStep < t2QuizQuestions.length - 1) {
        footerHtml += `<button type="button" class="btn btn-cookie-brown btn-sm" onclick="nextT2QuizQuestion()">Next</button>`;
    } else {
        footerHtml += `<button type="button" class="btn btn-cookie-brown btn-sm" onclick="finishT2Quiz()">Finish</button>`;
    }
    footerEl.innerHTML = footerHtml;
}

function saveT2QuizStep() {
    const question = t2QuizQuestions[t2QuizStep];
    switch (question.type) {
        case 'number':
            t2QuizAnswers[question.field] = parseFloat(document.getElementById('quizInput').value) || 0;
            break;
        case 'multi-number':
            question.fields.forEach(f => {
                t2QuizAnswers[f.id] = parseFloat(document.getElementById(`quizInput_${f.id}`).value) || 0;
            });
            break;
    }
}

function nextT2QuizQuestion() {
    saveT2QuizStep();
    if (t2QuizStep < t2QuizQuestions.length - 1) {
        t2QuizStep++;
        renderT2QuizQuestion();
    }
}

function prevT2QuizQuestion() {
    saveT2QuizStep();
    if (t2QuizStep > 0) {
        t2QuizStep--;
        renderT2QuizQuestion();
    }
}

function finishT2Quiz() {
    saveT2QuizStep();
    calculatorInputs.corpTax = { ...t2QuizAnswers };
    
    const modalEl = document.getElementById('t2QuizModal');
    if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        bsModal.hide();
    }

    loadCalculatorForm('corpTax');
    calculateResults();
} 