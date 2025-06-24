// Individual Tax Calculator
function calcIndTax(input) {
    // Validate inputs
    if (!input || typeof input !== 'object') {
        return { error: 'Invalid input data' };
    }

    // Extract input values with defaults
    const salary = parseFloat(input.salary) || 0;
    const eligibleDiv = parseFloat(input.eligibleDiv) || 0;
    const nonEligibleDiv = parseFloat(input.nonEligibleDiv) || 0;
    const otherIncome = parseFloat(input.otherIncome) || 0;
    const capitalGains = parseFloat(input.capitalGains) || 0;
    const foreignIncome = parseFloat(input.foreignIncome) || 0;
    const rentalIncome = parseFloat(input.rentalIncome) || 0;
    const businessIncome = parseFloat(input.businessIncome) || 0;
    const pensionIncome = parseFloat(input.pensionIncome) || 0;
    const deductions = parseFloat(input.deductions) || 0;
    const rrspDeduction = parseFloat(input.rrspDeduction) || 0;
    const unionDues = parseFloat(input.unionDues) || 0;
    const employmentExpenses = parseFloat(input.employmentExpenses) || 0;
    const otherDeductions = parseFloat(input.otherDeductions) || 0;
    const age = parseInt(input.age) || 35;
    const province = input.province || 'QC';

    const childCareExpenses = parseFloat(input.childCareExpenses) || 0;
    const movingExpenses = parseFloat(input.movingExpenses) || 0;
    const supportPayments = parseFloat(input.supportPayments) || 0;
    const spouseAmount = parseFloat(input.spouseAmount) || 0;
    const medicalExpenses = parseFloat(input.medicalExpenses) || 0;
    const charitableDonations = parseFloat(input.charitableDonations) || 0;
    const tuitionFees = parseFloat(input.tuitionFees) || 0;
    const transitPasses = parseFloat(input.transitPasses) || 0;
    const homeAccessibility = parseFloat(input.homeAccessibility) || 0;

    // Calculate total income
    const employmentIncome = salary;
    const eligibleDivGrossUp = eligibleDiv * 1.38; // 38% gross-up for eligible dividends
    const nonEligibleDivGrossUp = nonEligibleDiv * 1.15; // 15% gross-up for non-eligible dividends
    const taxableCapitalGains = capitalGains * 0.5; // 50% inclusion rate

    const totalIncome = employmentIncome + eligibleDivGrossUp + nonEligibleDivGrossUp + 
                       otherIncome + taxableCapitalGains + foreignIncome + 
                       rentalIncome + businessIncome + pensionIncome;

    // Calculate total deductions
    const totalDeductions = deductions + rrspDeduction + unionDues + employmentExpenses + 
                           otherDeductions + childCareExpenses + movingExpenses + supportPayments;

    // For simplicity, assume net income equals total income (no deductions)
    const netIncome = Math.max(0, totalIncome - totalDeductions);
    const taxableIncome = netIncome;

    // Calculate federal tax
    const federalTax = calculateTaxOnIncome(taxableIncome, taxRates.fed);
    
    // Calculate provincial tax with Quebec abatement
    let provincialTax, quebecAbatement = 0;
    if (province === 'QC') {
        provincialTax = calculateTaxOnIncome(taxableIncome, taxRates.qc);
        // Quebec abatement is 16.5% of federal tax (up to certain limits)
        quebecAbatement = federalTax * 0.165;
    } else {
        provincialTax = calculateTaxOnIncome(taxableIncome, taxRates.fed) * 0.1; // Simplified
    }

    // Calculate basic personal amount credit
    const federalBasicPersonalAmount = 15000; // 2025 amount
    const provincialBasicPersonalAmount = province === 'QC' ? 16143 : 14398;
    
    const federalBasicCredit = federalBasicPersonalAmount * 0.15;
    const provincialBasicCredit = provincialBasicPersonalAmount * (province === 'QC' ? 0.14 : 0.1);

    // Calculate dividend tax credits
    const federalDivCredit = (eligibleDiv * 0.2508) + (nonEligibleDiv * 0.0901);
    const provincialDivCredit = province === 'QC' ? 
        (eligibleDiv * 0.11) + (nonEligibleDiv * 0.0375) : 
        (eligibleDiv * 0.1) + (nonEligibleDiv * 0.05);

    // Calculate additional non-refundable credits
    const spouseCredit = spouseAmount * 0.15; // Federal rate
    const medicalCredit = Math.max(0, (medicalExpenses - Math.min(netIncome * 0.03, 2635)) * 0.15);
    const charitableCredit = charitableDonations <= 200 ? 
        charitableDonations * 0.15 : 
        200 * 0.15 + (charitableDonations - 200) * 0.29;
    const tuitionCredit = tuitionFees * 0.15;
    const transitCredit = transitPasses * 0.15; // If still applicable
    const accessibilityCredit = homeAccessibility * 0.15;

    // Calculate age credit (if 65 or older)
    const ageCredit = age >= 65 ? 
        Math.max(0, (8790 - Math.max(0, netIncome - 42335)) * 0.15) : 0;

    // Total non-refundable credits
    const totalFederalCredits = federalBasicCredit + federalDivCredit + ageCredit + 
                               spouseCredit + medicalCredit + charitableCredit + 
                               tuitionCredit + transitCredit + accessibilityCredit;
    const totalProvincialCredits = provincialBasicCredit + provincialDivCredit + 
                                  (province === 'QC' ? quebecAbatement : 0);

    // Net tax after credits
    const netFederalTax = Math.max(0, federalTax - totalFederalCredits - quebecAbatement);
    const netProvincialTax = Math.max(0, provincialTax - totalProvincialCredits);
    const totalTax = netFederalTax + netProvincialTax;

    // Calculate marginal and effective rates
    const marginalRate = calculateMarginalTaxRate(taxableIncome, taxRates.fed, taxRates.qc, province);
    const effectiveRate = totalIncome > 0 ? totalTax / totalIncome : 0;

    return {
        totalIncome: totalIncome,
        taxableIncome: taxableIncome,
        federalTax: netFederalTax,
        provincialTax: netProvincialTax,
        netTax: totalTax,
        marginalRate: marginalRate,
        effectiveRate: effectiveRate,
        federalCredits: totalFederalCredits,
        provincialCredits: totalProvincialCredits,
        eligibleDivGrossUp: eligibleDivGrossUp - eligibleDiv,
        nonEligibleDivGrossUp: nonEligibleDivGrossUp - nonEligibleDiv,
        taxableCapitalGains: taxableCapitalGains,
        deductions: deductions,
        rrspDeduction: rrspDeduction,
        unionDues: unionDues,
        employmentExpenses: employmentExpenses,
        otherDeductions: otherDeductions,
        childCareExpenses: childCareExpenses,
        movingExpenses: movingExpenses,
        supportPayments: supportPayments,
        spouseAmount: spouseAmount,
        medicalExpenses: medicalExpenses,
        charitableDonations: charitableDonations,
        tuitionFees: tuitionFees,
        transitPasses: transitPasses,
        homeAccessibility: homeAccessibility,
        quebecAbatement: quebecAbatement,
        totalDeductions: totalDeductions,
        afterTaxIncome: totalIncome - totalTax
    };
}

// Calculate tax on income using progressive brackets
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

// Calculate marginal tax rate
function calculateMarginalTaxRate(income, federalBrackets, provincialBrackets, province) {
    const federalRate = getMarginalRate(income, federalBrackets);
    const provincialRate = province === 'QC' ? 
        getMarginalRate(income, provincialBrackets) : 
        federalRate * 0.1; // Simplified for other provinces

    return federalRate + provincialRate;
}

// Get marginal rate for specific income level
function getMarginalRate(income, brackets) {
    for (const bracket of brackets) {
        if (income >= bracket.min && income < bracket.max) {
            return bracket.rate;
        }
    }
    return brackets[brackets.length - 1].rate; // Return highest rate if income exceeds all brackets
}

// Enhanced individual tax form loader
function loadIndTaxForm(container) {
    container.innerHTML = '';
    container.className = 'fade-in';

    const inputs = calculatorInputs.indTax;

    // Add Quiz Button
    const quizButtonRow = document.createElement('div');
    quizButtonRow.className = 'text-center mb-3';
    quizButtonRow.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm" onclick="startT1Quiz()">
            <i class="bi bi-question-circle"></i> Start T1 Quiz Assistant
        </button>
    `;
    container.appendChild(quizButtonRow);

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
        inputEl.onchange = (e) => updateInput('indTax', key, inputEl);
        const tdLabel = document.createElement('td');
        tdLabel.innerHTML = `${lineNumber ? `<small class="text-muted">${lineNumber}</small> ` : ''}${label}`;
        const tdInput = document.createElement('td');
        tdInput.appendChild(inputEl);
        tr.appendChild(tdLabel);
        tr.appendChild(tdInput);
        tbody.appendChild(tr);
    };

    // Income section - follow T1 General structure
    addSectionHeader('Income (Lines 101-147)');
    addInputRow('Employment income', 'salary', '101');
    addInputRow('Other employment income', 'otherIncome', '104');
    addInputRow('Old Age Security pension', 'pensionIncome', '113');
    addInputRow('Taxable amount of dividends', 'eligibleDiv', '120');
    addInputRow('Non-eligible dividends', 'nonEligibleDiv', '180');
    addInputRow('Interest and other investment income', 'foreignIncome', '121');
    addInputRow('Net rental income', 'rentalIncome', '126');
    addInputRow('Taxable capital gains', 'capitalGains', '127');
    addInputRow('Net business income', 'businessIncome', '135');

    // Total Income calculation row (read-only display)
    const totalIncomeRow = document.createElement('tr');
    totalIncomeRow.className = 'table-warning';
    totalIncomeRow.innerHTML = `
        <td><strong>Total Income (Line 150)</strong></td>
        <td class="text-end"><strong id="totalIncomeDisplay">$0.00</strong></td>
    `;
    tbody.appendChild(totalIncomeRow);

    // Deductions section - T1 deductions
    addSectionHeader('Deductions (Lines 206-236)');
    addInputRow('RRSP deduction', 'rrspDeduction', '208');
    addInputRow('Child care expenses', 'childCareExpenses', '214');
    addInputRow('Support payments', 'supportPayments', '220');
    addInputRow('Moving expenses', 'movingExpenses', '219');
    addInputRow('Union dues', 'unionDues', '212');
    addInputRow('Employment expenses', 'employmentExpenses', '229');
    addInputRow('Other deductions', 'otherDeductions', '232');

    // Total Deductions calculation row (read-only display)
    const totalDeductionsRow = document.createElement('tr');
    totalDeductionsRow.className = 'table-warning';
    totalDeductionsRow.innerHTML = `
        <td><strong>Total Deductions (Line 236)</strong></td>
        <td class="text-end"><strong id="totalDeductionsDisplay">$0.00</strong></td>
    `;
    tbody.appendChild(totalDeductionsRow);

    // Credits section - Non-refundable tax credits
    addSectionHeader('Non-Refundable Tax Credits (Lines 300-350)');
    addInputRow('Spouse or common-law amount', 'spouseAmount', '303');
    addInputRow('Medical expenses', 'medicalExpenses', '330');
    addInputRow('Charitable donations', 'charitableDonations', '349');
    addInputRow('Tuition fees', 'tuitionFees', '323');
    addInputRow('Public transit passes', 'transitPasses', '364');
    addInputRow('Home accessibility', 'homeAccessibility', '398');

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);

    // Add event listeners to update totals
    updateTotalsDisplay();
}

// Helper function to create form sections
function createFormSection(title, icon) {
    const section = document.createElement('div');
    section.className = 'mb-4';
    section.innerHTML = `
        <h6 class="text-cookie-brown mb-3">
            <i class="${icon} me-2 text-cookie-orange"></i>
            ${title}
        </h6>
    `;
    return section;
}

// Helper function to create form groups
function createFormGroup(key, label, type, icon, description, value) {
    const inputElement = type === 'number' ? 
        `<input type="number" class="form-control" value="${value || ''}" onchange="updateInput('indTax', '${key}', this)" placeholder="0.00" step="0.01" min="0">` :
        `<input type="text" class="form-control" value="${value || ''}" onchange="updateInput('indTax', '${key}', this)" placeholder="Enter ${label.toLowerCase()}">`;

    return `
        <div class="mb-3">
            <label class="form-label d-flex align-items-center">
                <i class="${icon} me-2 text-cookie-orange"></i>
                <span class="fw-semibold text-cookie-brown">${label}</span>
            </label>
            <div class="input-group">
                <span class="input-group-text">
                    <i class="${icon} text-cookie-brown"></i>
                </span>
                ${inputElement}
                ${type === 'number' ? '<span class="input-group-text"><small class="text-cookie-brown fw-semibold">CAD</small></span>' : ''}
            </div>
            <div class="form-text">
                <i class="bi bi-info-circle me-1 text-cookie-orange"></i>
                <span class="text-cookie-brown">${description}</span>
            </div>
        </div>
    `;
}

// T1 Quiz Assistant Function
function startT1Quiz() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 't1QuizModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-cookie-cream">
                    <h5 class="modal-title text-cookie-brown">
                        <i class="bi bi-question-circle me-2"></i>T1 Quiz Assistant
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="quizBody">
                    <div id="quizProgress" class="progress mb-3">
                        <div class="progress-bar bg-cookie-brown" style="width: 0%"></div>
                    </div>
                    <div id="quizContent"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-cookie-brown" id="quizNextBtn" onclick="nextQuizQuestion()">Next</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Initialize quiz
    currentQuizStep = 0;
    quizAnswers = {};
    showQuizQuestion();
    
    // Clean up modal when closed
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

let currentQuizStep = 0;
let quizAnswers = {};

const quizQuestions = [
    {
        question: "What types of income did you receive this year?",
        type: "category",
        category: "income",
        options: [
            { label: "Employment income (T4)", field: "salary" },
            { label: "Eligible dividends (T5)", field: "eligibleDiv" },
            { label: "Non-eligible dividends", field: "nonEligibleDiv" },
            { label: "Capital gains", field: "capitalGains" },
            { label: "Rental income", field: "rentalIncome" },
            { label: "Business income", field: "businessIncome" },
            { label: "Pension income (OAS, CPP)", field: "pensionIncome" },
            { label: "Interest/investment income", field: "foreignIncome" },
            { label: "Other income", field: "otherIncome" }
        ]
    },
    {
        question: "What deductions and credits apply to you?",
        type: "category",
        category: "deductions",
        options: [
            { label: "RRSP contributions", field: "rrspDeduction" },
            { label: "Union/professional dues", field: "unionDues" },
            { label: "Employment expenses (T777)", field: "employmentExpenses" },
            { label: "Child care expenses", field: "childCareExpenses" },
            { label: "Moving expenses", field: "movingExpenses" },
            { label: "Support payments", field: "supportPayments" },
            { label: "Other deductions", field: "otherDeductions" }
        ]
    },
    {
        question: "What tax credits do you qualify for?",
        type: "category", 
        category: "credits",
        options: [
            { label: "Basic personal amount", field: "basicPersonalAmount", auto: true },
            { label: "Spouse/common-law amount", field: "spouseAmount" },
            { label: "Medical expenses", field: "medicalExpenses" },
            { label: "Charitable donations", field: "charitableDonations" },
            { label: "Tuition fees", field: "tuitionFees" },
            { label: "Public transit passes", field: "transitPasses" },
            { label: "Home accessibility", field: "homeAccessibility" }
        ]
    },
    {
        question: "Quebec-specific credits (if applicable):",
        type: "category",
        category: "quebec_credits", 
        options: [
            { label: "Quebec abatement", field: "quebecAbatement", auto: true },
            { label: "Solidarity tax credit", field: "solidarityCredit" },
            { label: "Work premium", field: "workPremium" },
            { label: "Quebec pension plan", field: "qppContributions" },
            { label: "Quebec parental insurance", field: "qpipContributions" }
        ]
    }
];

function showQuizQuestion() {
    const question = quizQuestions[currentQuizStep];
    const progress = ((currentQuizStep + 1) / quizQuestions.length) * 100;
    
    document.querySelector('#quizProgress .progress-bar').style.width = `${progress}%`;
    
    if (question.type === "category") {
        const optionsHtml = question.options.map((option, index) => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="quiz_${option.field}" ${option.auto ? 'checked disabled' : ''}>
                <label class="form-check-label" for="quiz_${option.field}">
                    ${option.label} ${option.auto ? '(automatic)' : ''}
                </label>
            </div>
        `).join('');
        
        document.getElementById('quizContent').innerHTML = `
            <h6 class="text-cookie-brown">${question.question}</h6>
            <div class="mt-3">
                ${optionsHtml}
            </div>
            <div class="mt-3">
                <button class="btn btn-outline-secondary me-2" onclick="skipQuizCategory()">Skip All</button>
                <button class="btn btn-cookie-brown" onclick="selectQuizItems()">Continue with Selected</button>
            </div>
        `;
    }
}

function skipQuizCategory() {
    nextQuizQuestion();
}

function selectQuizItems() {
    const question = quizQuestions[currentQuizStep];
    const selectedItems = [];
    
    question.options.forEach(option => {
        const checkbox = document.getElementById(`quiz_${option.field}`);
        if (checkbox && checkbox.checked && !option.auto) {
            selectedItems.push(option);
        }
    });
    
    if (selectedItems.length === 0) {
        nextQuizQuestion();
        return;
    }
    
    // Show input form for selected items
    currentSelectedItems = selectedItems;
    currentItemIndex = 0;
    showItemInput();
}

let currentSelectedItems = [];
let currentItemIndex = 0;

function showItemInput() {
    if (currentItemIndex >= currentSelectedItems.length) {
        nextQuizQuestion();
        return;
    }
    
    const item = currentSelectedItems[currentItemIndex];
    document.getElementById('quizContent').innerHTML = `
        <h6 class="text-cookie-brown">Enter amount for: ${item.label}</h6>
        <div class="input-group mt-3">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control" id="quizInput" min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="mt-3">
            <button class="btn btn-outline-secondary me-2" onclick="skipCurrentItem()">Skip</button>
            <button class="btn btn-cookie-brown" onclick="saveCurrentItem()">Save & Continue</button>
        </div>
    `;
    document.getElementById('quizInput').focus();
}

function skipCurrentItem() {
    currentItemIndex++;
    showItemInput();
}

function saveCurrentItem() {
    const item = currentSelectedItems[currentItemIndex];
    const input = document.getElementById('quizInput');
    quizAnswers[item.field] = parseFloat(input.value) || 0;
    currentItemIndex++;
    showItemInput();
}

function nextQuizQuestion() {
    const question = quizQuestions[currentQuizStep];
    const input = document.getElementById('quizInput');
    
    if (input) {
        quizAnswers[question.field] = parseFloat(input.value) || 0;
    }
    
    currentQuizStep++;
    
    if (currentQuizStep >= quizQuestions.length) {
        // Quiz complete - apply answers
        for (const [field, value] of Object.entries(quizAnswers)) {
            calculatorInputs.indTax[field] = value;
        }
        
        // Close modal and refresh form
        bootstrap.Modal.getInstance(document.getElementById('t1QuizModal')).hide();
        loadIndTaxForm(document.getElementById('inputForm'));
        calculateResults();
    } else {
        showQuizQuestion();
    }
}

// Function to update total displays
function updateTotalsDisplay() {
    const inputs = calculatorInputs.indTax;
    
    // Calculate total income with gross-ups
    const salary = parseFloat(inputs.salary) || 0;
    const eligibleDiv = parseFloat(inputs.eligibleDiv) || 0;
    const nonEligibleDiv = parseFloat(inputs.nonEligibleDiv) || 0;
    const capitalGains = parseFloat(inputs.capitalGains) || 0;
    const otherIncome = parseFloat(inputs.otherIncome) || 0;
    const foreignIncome = parseFloat(inputs.foreignIncome) || 0;
    const rentalIncome = parseFloat(inputs.rentalIncome) || 0;
    const businessIncome = parseFloat(inputs.businessIncome) || 0;
    const pensionIncome = parseFloat(inputs.pensionIncome) || 0;
    
    const eligibleDivGrossUp = eligibleDiv * 1.38;
    const nonEligibleDivGrossUp = nonEligibleDiv * 1.15;
    const taxableCapitalGains = capitalGains * 0.5;
    
    const totalIncome = salary + eligibleDivGrossUp + nonEligibleDivGrossUp + 
                       otherIncome + taxableCapitalGains + foreignIncome + 
                       rentalIncome + businessIncome + pensionIncome;
    
    // Calculate total deductions
    const rrspDeduction = parseFloat(inputs.rrspDeduction) || 0;
    const unionDues = parseFloat(inputs.unionDues) || 0;
    const employmentExpenses = parseFloat(inputs.employmentExpenses) || 0;
    const childCareExpenses = parseFloat(inputs.childCareExpenses) || 0;
    const movingExpenses = parseFloat(inputs.movingExpenses) || 0;
    const supportPayments = parseFloat(inputs.supportPayments) || 0;
    const otherDeductions = parseFloat(inputs.otherDeductions) || 0;
    const deductions = parseFloat(inputs.deductions) || 0;
    
    const totalDeductions = deductions + rrspDeduction + unionDues + employmentExpenses + 
                           otherDeductions + childCareExpenses + movingExpenses + supportPayments;
    
    // Update displays
    const totalIncomeEl = document.getElementById('totalIncomeDisplay');
    const totalDeductionsEl = document.getElementById('totalDeductionsDisplay');
    
    if (totalIncomeEl) {
        totalIncomeEl.textContent = `$${totalIncome.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (totalDeductionsEl) {
        totalDeductionsEl.textContent = `$${totalDeductions.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
} 