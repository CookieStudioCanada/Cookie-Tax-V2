// Application State
let currentCalculator = null;
let taxRates = null;
let calculatorInputs = {};
let currentResults = {}; // Store results of the last calculation

// Calculator definitions
const calculators = {
    indTax: {
        name: 'Individual Tax',
        type: 'Personal',
        icon: 'bi-person',
        description: 'Calculate combined Quebec and Federal individual income tax for various income types and personal credits.',
        lawText: [
            { text: 'ITA s.3', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-3.html' },
            { text: 'ITA s.117-118.9', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-117.html' },
            { text: 'ITA s.121', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-121.html' },
            { text: 'ITA s.38-55', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-38.html' }
        ],
        craFolios: [
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-1-individuals/folio-2-students/income-tax-folio-s1-f2-c3-scholarships-research-grants-other-education-assistance.html' },
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-1-individuals/folio-3-family-unit-issues/income-tax-folio-s1-f3-c1-child-care-expense-deduction.html' }
        ],
        commentary: 'Individual taxation in Canada operates on a dual federal-provincial system with Quebec maintaining unique administrative independence. The calculator uses 2025 tax rates.<br/><br/><strong>Federal Rates:</strong><br/>- 15% on income up to $55,867<br/>- 20.5% up to $111,733<br/>- 26% up to $173,205<br/>- 29% up to $246,752<br/>- 33% on income over $246,752.<br/><br/><strong>Quebec Rates:</strong><br/>- 14% up to $51,780<br/>- 19% up to $103,545<br/>- 24% up to $126,000<br/>- 25.75% over $126,000.<br/><br/>Key considerations include income characterization (employment vs. business), the dividend tax credit mechanism which integrates corporate and personal tax, and various personal tax credits like the Basic Personal Amount. This calculator provides a simplified view and does not include all possible credits or deductions.'
    },
    corpTax: {
        name: 'Corporate Tax',
        type: 'Business',
        icon: 'bi-building',
        description: 'Calculate corporate tax with small business deduction, refundable taxes, and dividend account integration.',
        lawText: [
            { text: 'ITA s.123-125', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-123.html' },
            { text: 'ITA s.129', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-129.html' },
            { text: 'ITA s.89', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-89.html' },
            { text: 'ITA s.186-187', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-186.html' }
        ],
        craFolios: [
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-15-manufacturing-processing/income-tax-folio-s4-f15-c1-manufacturing-processing.html' },
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-3-property-investments-savings-plans/series-3-property-investments-savings-plan-folio-6-interest/income-tax-folio-s3-f6-c1-interest-deductibility.html' }
        ],
        commentary: 'Corporate taxation is based on the theory of integration, where corporate tax is a prepayment of the ultimate shareholder tax. The Small Business Deduction (SBD) significantly reduces tax on the first $500,000 of active business income for CCPCs. The general federal rate is 15% after abatement, while the SBD rate is 9%. Quebec rates are 11.5% (general) and 3.2% (SBD).<br/><br/>Interest on money borrowed to earn business income is generally deductible per ITA 20(1)(c), as clarified in Folio S3-F6-C1. The borrowed funds must be used for the purpose of earning income from a business or property. This calculator models the tax on Active Business Income (ABI) and the additions to dividend accounts like GRIP and LRIP.'
    },
    corpCapGain: {
        name: 'Capital Gain',
        type: 'Investment',
        icon: 'bi-graph-up',
        description: 'Calculate capital gains for individuals or corporations, including all applicable tax implications.',
        lawText: [
            { text: 'ITA s.38-55', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-38.html' },
            { text: 'ITA s.83(2)', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-83.html' },
            { text: 'ITA s.129(4)', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-129.html' },
            { text: 'ITA s.55(2)', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-55.html' }
        ],
        craFolios: [
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-3-business-transactions/income-tax-folio-s4-f3-c1-price-adjustment-clauses.html' },
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-8-capital-gains-losses/income-tax-folio-s4-f8-c1-business-investment-losses.html' }
        ],
        commentary: 'A capital gain arises when you dispose of capital property for more than its adjusted cost base (ACB). Only 50% of the capital gain is taxable (the "taxable capital gain").<br/><br/>For **individuals**, the taxable portion is added to income and taxed at marginal rates. For **corporations**, the non-taxable portion (50%) is added to the Capital Dividend Account (CDA), allowing tax-free distributions to shareholders. The taxable portion is taxed at corporate rates, with a portion being refundable upon payment of dividends.<br/><br/>The "safe income bump" is a planning tool under s.55(2) to reduce a capital gain on inter-corporate share sales by the amount of tax-paid retained earnings ("safe income") attributable to the shares.'
    },
    deathTax: {
        name: 'Death Tax',
        type: 'Estate',
        icon: 'bi-x-diamond',
        description: 'Calculate deemed disposition tax on death with estate planning and rollover considerations.',
        lawText: [
            { text: 'ITA s.70(5)', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-70.html' },
            { text: 'ITA s.73', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-73.html' },
            { text: 'ITA s.104', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-104.html' }
        ],
        craFolios: [
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-1-individuals/folio-5-transfer-income-property-rights-trusts/income-tax-folio-s1-f5-c1-related-persons-dealing-arms-length.html' }
        ],
        commentary: 'In Canada, there is no "inheritance tax". Instead, a person is deemed to have disposed of all their capital property immediately before death at Fair Market Value (FMV). This can trigger significant capital gains on the deceased\'s final tax return.<br/><br/>A key estate planning tool is the **spousal rollover** under ITA 70(6), which allows property to be transferred to a surviving spouse or common-law partner on a tax-deferred basis. The spouse receives the property at the deceased\'s ACB, and any capital gain is deferred until the spouse disposes of it or dies. This calculator models the tax impact with and without this election.'
    },
    rollover85: {
        name: 'Section 85 Rollover',
        type: 'Reorganization',
        icon: 'bi-arrow-repeat',
        description: 'Model a tax-deferred transfer of property to a corporation with elected proceeds and boot.',
        lawText: [
            { text: 'ITA s.85', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-85.html' },
            { text: 'ITA s.84.1', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-84.1.html' }
        ],
        craFolios: [
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-7-amalgamations-windings-up/income-tax-folio-s4-f7-c1-amalgamations-canadian-corporations.html' }
        ],
        commentary: 'Section 85 allows a taxpayer to transfer eligible property to a taxable Canadian corporation on a tax-deferred basis. This is a cornerstone of corporate reorganizations, incorporations, and estate freezes.<br/><br/>The transferor and corporation must make a joint election (Form T2057) specifying an "elected amount". This amount becomes the proceeds of disposition for the transferor and the cost for the corporation. The elected amount cannot be less than any non-share consideration ("boot") received, nor can it be greater than the property\'s FMV. Any gain can be deferred by setting the elected amount at the property\'s ACB. Boot received can trigger immediate gains.'
    },
    departureTax: {
        name: 'Departure Tax',
        type: 'International',
        icon: 'bi-airplane',
        description: 'Calculate deemed disposition tax on emigration from Canada, with available elections and security.',
        lawText: [
            { text: 'ITA s.128.1', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-128.1.html' },
            { text: 'ITA s.220(4.5)', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-220.html' }
        ],
        craFolios: [
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-5-international-residency/folio-1-residency/income-tax-folio-s5-f1-c1-determining-individuals-residence-status.html' },
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-5-international-residency/folio-2-foreign-tax-credits-deductions/income-tax-folio-s5-f2-c1-foreign-tax-credit.html' }
        ],
        commentary: 'When an individual ceases to be a resident of Canada, they are subject to a "departure tax". This involves a deemed disposition of most of their worldwide property at FMV. This prevents individuals from avoiding Canadian tax on accrued gains.<br/><br/>Certain properties are exempt, such as Canadian real estate, RRSPs, and property of a business carried on through a permanent establishment in Canada. Taxpayers can elect to defer payment of the departure tax by posting security with the CRA. This calculator models the potential tax liability upon emigration.'
    },
    amt: {
        name: 'Alternative Minimum Tax',
        type: 'Anti-Avoidance',
        icon: 'bi-shield-exclamation',
        description: 'Calculate Alternative Minimum Tax (AMT) under the new (2024+) rules for high-income earners.',
        lawText: [
            { text: 'ITA s.127.5', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-127.5.html' },
            { text: 'ITA s.127.52', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-127.52.html' }
        ],
        craFolios: [],
        commentary: 'The AMT is a parallel tax calculation that allows fewer deductions, exemptions, and credits than the regular tax system. Taxpayers pay the higher of the regular tax and the AMT. For 2024 and later years, the AMT has been significantly reformed.<br/><br/><strong>Key Changes:</strong><br/>- Basic Exemption: ~$173,000 (up from $40,000).<br/>- AMT Rate: 20.5% (up from 15%).<br/>- Broadened Base: More tax preferences are added back. Capital gains inclusion is 100% (up from 80% for AMT purposes), and only 50% of many non-refundable credits are allowed.<br/><br/>The AMT ensures that high-income individuals who benefit from tax preference items pay a minimum level of tax. Any extra tax paid as AMT can be carried forward for 7 years to offset regular tax.'
    },
    windup88: {
        name: 'Wind-up',
        type: 'Reorganization',
        icon: 'bi-arrow-up-circle',
        description: 'Calculate tax implications of a corporate wind-up under section 88, including distribution analysis.',
        lawText: [
            { text: 'ITA s.88(1)', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-88.html' },
            { text: 'ITA s.88(2)', url: 'https://laws-lois.justice.gc.ca/eng/acts/I-3.3/section-88.html' }
        ],
        craFolios: [
            { url: 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-7-amalgamations-windings-up/income-tax-folio-s4-f7-c1-amalgamations-canadian-corporations.html' }
        ],
        commentary: 'A wind-up under s.88(1) allows a wholly-owned subsidiary to be wound up into its parent corporation on a tax-deferred basis. Assets of the subsidiary can have their tax cost "bumped" up to their FMV in the parent, providing a future tax shield.<br/><br/>A s.88(2) wind-up applies to other cases and is generally a taxable event. It involves a deemed disposition of assets at FMV. The distribution of assets to shareholders follows a specific order: first a return of Paid-Up Capital (PUC), then a deemed dividend from accounts like the Capital Dividend Account (CDA) and GRIP, which can be distributed tax-free or at lower rates.'
    }
};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadTaxRates();
    initializeCalculatorInputs();
    renderCalculatorCards();
    showHome();
});

// Load tax rates from JSON
async function loadTaxRates() {
    try {
        const response = await fetch('data/2025.json');
        taxRates = await response.json();
    } catch (error) {
        console.error('Error loading tax rates:', error);
        // Fallback tax rates
        taxRates = {
            fed: [
                { min: 0, max: 55867, rate: 0.15 },
                { min: 55867, max: 111733, rate: 0.205 },
                { min: 111733, max: 173205, rate: 0.26 },
                { min: 173205, max: 246752, rate: 0.29 },
                { min: 246752, max: 999999999, rate: 0.33 }
            ],
            qc: [
                { min: 0, max: 51780, rate: 0.14 },
                { min: 51780, max: 103545, rate: 0.19 },
                { min: 103545, max: 126000, rate: 0.24 },
                { min: 126000, max: 999999999, rate: 0.2575 }
            ]
        };
    }
}

// Initialize default input values for all calculators
function initializeCalculatorInputs() {
    calculatorInputs = {
        indTax: {
            salary: 0,
            eligibleDiv: 0,
            nonEligibleDiv: 0,
            otherIncome: 0,
            capitalGains: 0,
            foreignIncome: 0,
            rentalIncome: 0,
            businessIncome: 0,
            pensionIncome: 0,
            deductions: 0,
            rrspDeduction: 0,
            unionDues: 0,
            employmentExpenses: 0,
            otherDeductions: 0,
            childCareExpenses: 0,
            movingExpenses: 0,
            supportPayments: 0,
            spouseAmount: 0,
            medicalExpenses: 0,
            charitableDonations: 0,
            tuitionFees: 0,
            transitPasses: 0,
            homeAccessibility: 0,
            solidarityCredit: 0,
            workPremium: 0,
            qppContributions: 0,
            qpipContributions: 0,
            age: 35,
            province: 'QC',
            maritalStatus: 'single',
            notes: ''
        },
        corpTax: {
            activeBusinessIncome: 0,
            investmentIncome: 0,
            foreignIncome: 0,
            otherIncome: 0,
            capitalGains: 0,
            businessDeductions: 0,
            cca: 0,
            interestExpense: 0,
            otherDeductions: 0,
            sbdEligibility: 100,
            associatedCorporations: false,
            passiveIncome: 0,
            rdtohEligible: 0,
            rdtohNonEligible: 0,
            grip: 0,
            lrip: 0,
            cda: 0,
            province: 'QC'
        },
        corpCapGain: {
            proceeds: 0,
            acb: 0,
            outlaysExpenses: 0,
            reserve: 0,
            safeIncomeBump: 0,
            vDay: 0,
            cdaBalance: 0,
            rdtohEligible: 0,
            rdtohNonEligible: 0,
            numberOfShares: 1,
            isCorporation: false,
            province: 'QC'
        },
        deathTax: {
            fmvCapitalProperty: 0,
            acbCapitalProperty: 0,
            fmvDepreciableProperty: 0,
            costDepreciableProperty: 0,
            uccDepreciableProperty: 0,
            rrspRifValue: 0,
            otherFinalIncome: 0,
            spousalRollover: false,
            province: 'QC'
        },
        rollover85: {
            propertyType: 'capital',
            fmv: 0,
            acb: 0,
            ucc: 0,
            boot: 0,
            electedAmount: 0,
            isIndividual: false
        },
        departureTax: {
            fmvNonTcp: 0,
            acbNonTcp: 0,
            otherIncome: 0,
            electToDefer: false,
            province: 'QC'
        },
        amt: {
            netIncome: 0,
            capitalGains: 0,
            stockOptionBenefit: 0,
            taxShelterLosses: 0,
            disallowedDeductions: 0,
            donationCreditsClaimed: 0,
            regularTaxPayable: 0
        },
        windup88: {
            puc: 0,
            grip: 0,
            cda: 0,
            nerdtoh: 0,
            rdtoh: 0
        }
    };
}

// Render calculator cards on home page
function renderCalculatorCards() {
    const container = document.getElementById('calculatorCards');
    container.innerHTML = '';

    for (const [key, calculator] of Object.entries(calculators)) {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
        card.innerHTML = `
            <div class="card calculator-card h-100" onclick="showCalculator('${key}')">
                <div class="card-body d-flex flex-column">
                    <div class="flex-grow-1">
                        <i class="${calculator.icon} calculator-icon"></i>
                        <h5 class="card-title text-cookie-brown">${calculator.name}</h5>
                        <p class="card-text text-muted small">${calculator.description}</p>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-outline-cookie-brown btn-sm w-100" 
                                onclick="event.stopPropagation(); showCalculatorModal('${key}')" 
                                data-bs-toggle="modal" data-bs-target="#calculatorModal">
                            <i class="bi bi-info-circle me-1"></i>Details & History
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

// Show home view
function showHome() {
    document.getElementById('homeView').style.display = 'block';
    document.getElementById('calculatorView').style.display = 'none';
    document.getElementById('dropdownText').textContent = 'Calculators';
    currentCalculator = null;
    
    // Clear action headers
    document.getElementById('inputFormHeaderActions').innerHTML = '';
    document.getElementById('outputDisplayHeaderActions').innerHTML = '';

    // Update active state in dropdown
    updateDropdownActiveState('home');
}

// Show calculator view
function showCalculator(calculatorKey) {
    currentCalculator = calculatorKey;
    const calculator = calculators[calculatorKey];
    
    document.getElementById('homeView').style.display = 'none';
    document.getElementById('calculatorView').style.display = 'block';
    document.getElementById('calculatorTitle').textContent = calculator.name;
    document.getElementById('dropdownText').textContent = calculator.name;

    // Clear action headers
    document.getElementById('inputFormHeaderActions').innerHTML = '';
    document.getElementById('outputDisplayHeaderActions').innerHTML = '';
    
    // Update active state in dropdown
    updateDropdownActiveState(calculatorKey);
    
    // Load calculator-specific form and run calculations
    loadCalculatorForm(calculatorKey);
    calculateResults();
}

// Update dropdown active state
function updateDropdownActiveState(activeKey) {
    // Remove active class from all dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current item
    if (activeKey === 'home') {
        document.querySelector('.dropdown-item[onclick="showHome()"]').classList.add('active');
    } else {
        document.querySelector(`.dropdown-item[onclick="showCalculator('${activeKey}')"]`).classList.add('active');
    }
}

// Load calculator-specific input form
function loadCalculatorForm(calculatorKey) {
    const formContainer = document.getElementById('inputForm');
    
    // Check if calculator has a custom form function
    const customFormFunction = window[`load${calculatorKey.charAt(0).toUpperCase() + calculatorKey.slice(1)}Form`];
    if (customFormFunction && typeof customFormFunction === 'function') {
        customFormFunction(formContainer);
    } else {
        loadGenericForm(calculatorKey, formContainer);
    }
}

// Load generic form for calculators without custom forms
function loadGenericForm(calculatorKey, container) {
    const inputs = calculatorInputs[calculatorKey];
    const inputConfigs = getInputConfig(calculatorKey);
    
    container.innerHTML = '';
    container.className = 'fade-in';
    
    inputConfigs.forEach(config => {
        const formGroup = document.createElement('div');
        formGroup.className = 'mb-3';
        
        // Handle conditional fields
        if (config.conditional) {
            formGroup.style.display = inputs[config.conditional] ? 'block' : 'none';
            formGroup.setAttribute('data-conditional', config.conditional);
        }
        
        formGroup.innerHTML = `
            <label class="form-label d-flex align-items-center">
                <i class="${config.icon} me-2 text-cookie-orange"></i>
                <span class="fw-semibold text-cookie-brown">${config.label}</span>
            </label>
            <div class="input-group">
                <span class="input-group-text">
                    <i class="${config.icon} text-cookie-brown"></i>
                </span>
                ${generateInputElement(config, inputs[config.key], calculatorKey)}
                ${config.type === 'number' ? '<span class="input-group-text"><small class="text-cookie-brown fw-semibold">CAD</small></span>' : ''}
            </div>
            <div class="form-text">
                <i class="bi bi-info-circle me-1 text-cookie-orange"></i>
                <span class="text-cookie-brown">${config.description}</span>
            </div>
        `;
        
        container.appendChild(formGroup);
    });
}

// Generate input element based on type
function generateInputElement(config, value, calculatorKey) {
    const commonAttrs = `onchange="updateInput('${calculatorKey}', '${config.key}', this)" class="form-control"`;
    
    switch (config.type) {
        case 'checkbox':
            return `
                <div class="form-control d-flex align-items-center">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" ${value ? 'checked' : ''} 
                               ${commonAttrs} id="${calculatorKey}-${config.key}">
                        <label class="form-check-label small text-cookie-brown ms-2" for="${calculatorKey}-${config.key}">
                            ${value ? 'Yes' : 'No'}
                        </label>
                    </div>
                </div>
            `;
        case 'number':
            return `<input type="number" ${commonAttrs} value="${value || ''}" placeholder="0.00" step="0.01" min="0">`;
        case 'select':
            const options = config.options.map(opt => 
                `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`
            ).join('');
            return `<select ${commonAttrs}>${options}</select>`;
        default:
            return `<input type="text" ${commonAttrs} value="${value || ''}" placeholder="Enter ${config.label.toLowerCase()}">`;
    }
}

// Update input value and recalculate
function updateInput(calculatorKey, field, element) {
    let value;
    
    if (element.type === 'checkbox') {
        value = element.checked;
        // Update label
        const label = element.nextElementSibling;
        if (label) {
            label.textContent = element.checked ? 'Yes' : 'No';
        }
        
        // Handle conditional fields visibility
        if (field === 'isCorporation') {
            const conditionalFields = document.querySelectorAll('[data-conditional="isCorporation"]');
            conditionalFields.forEach(fieldElement => {
                fieldElement.style.display = value ? 'block' : 'none';
            });
        }
    } else if (element.type === 'number') {
        value = parseFloat(element.value) || 0;
    } else {
        value = element.value;
    }
    
    calculatorInputs[calculatorKey][field] = value;
    
    // Update totals display for indTax and corpTax
    if (calculatorKey === 'indTax' && typeof updateTotalsDisplay === 'function') {
        updateTotalsDisplay();
    } else if (calculatorKey === 'corpTax' && typeof updateCorpTotalsDisplay === 'function') {
        updateCorpTotalsDisplay();
    }
    
    calculateResults();
}

// Calculate and display results
function calculateResults() {
    if (!currentCalculator) return;
    
    const outputContainer = document.getElementById('outputDisplay');
    outputContainer.innerHTML = '<div class="d-flex justify-content-center p-5"><div class="spinner-border spinner-border-cookie" role="status"><span class="visually-hidden">Calculating...</span></div></div>';
    
    setTimeout(() => {
        try {
            const calculateFunction = window[`calc${currentCalculator.charAt(0).toUpperCase() + currentCalculator.slice(1)}`];
            if (calculateFunction && typeof calculateFunction === 'function') {
                const results = calculateFunction(calculatorInputs[currentCalculator]);
                currentResults = results; // Store results globally for saving
                displayResults(results);
            } else {
                displayGenericResults();
            }
        } catch (error) {
            console.error('Calculation error:', error);
            outputContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Error performing calculation. Please check your inputs.
                </div>
            `;
        }
    }, 200);
}

// Display calculation results
function displayResults(results) {
    const container = document.getElementById('outputDisplay');
    container.innerHTML = '';
    container.className = 'fade-in';
    
    // Use custom renderer for Individual Tax calculator
    if (currentCalculator === 'indTax') {
        displayIndTaxResults(results);
        return;
    }
    
    // Use custom renderer for Corporate Tax calculator
    if (currentCalculator === 'corpTax') {
        displayCorpTaxResults(results);
        return;
    }
    
    // Use custom renderer for Capital Gains calculator
    if (currentCalculator === 'corpCapGain') {
        displayCapGainResults(results);
        return;
    }
    
    // Use custom renderer for Death Tax calculator
    if (currentCalculator === 'deathTax') {
        displayDeathTaxResults(results);
        return;
    }

    // Use custom renderer for Section 85 Rollover calculator
    if (currentCalculator === 'rollover85') {
        displayRollover85Results(results);
        return;
    }

    // Use custom renderer for Departure Tax calculator
    if (currentCalculator === 'departureTax') {
        displayDepartureTaxResults(results);
        return;
    }

    // Use custom renderer for AMT calculator
    if (currentCalculator === 'amt') {
        displayAmtResults(results);
        return;
    }

    // Use custom renderer for Wind-up calculator
    if (currentCalculator === 'windup88') {
        displayWindup88Results(results);
        return;
    }

    if (!results || Object.keys(results).length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calculator display-4 text-muted"></i>
                <p class="text-muted mt-2">Enter values to see calculations</p>
            </div>
        `;
        return;
    }
    
    // Save button
    document.getElementById('outputDisplayHeaderActions').innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm me-2" onclick="showCalculatorModal('${currentCalculator}')" data-bs-toggle="modal" data-bs-target="#calculatorModal">
            <i class="bi bi-info-circle"></i> <span class="d-none d-md-inline">Details</span>
        </button>
        <button id="saveCalculationBtn" class="btn btn-sm btn-cookie-brown" onclick="addToHistory(currentCalculator)">
            <i class="bi bi-save"></i> <span class="d-none d-md-inline">Save</span>
        </button>`;

    for (const [key, value] of Object.entries(results)) {
        if (value !== null && value !== undefined) {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const formattedValue = typeof value === 'number' ? 
                (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percentage') ? 
                    `${(value * 100).toFixed(2)}%` : 
                    `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) :
                (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value);
            
            resultItem.innerHTML = `
                <div class="result-label">${formatLabel(key)}</div>
                <div class="result-value">${formattedValue}</div>
            `;
            
            container.appendChild(resultItem);
        }
    }
}

// Display generic results for calculators without custom calculation functions
function displayGenericResults() {
    const container = document.getElementById('outputDisplay');
    const inputs = calculatorInputs[currentCalculator];
    
    container.innerHTML = `
        <div class="result-item">
            <div class="result-label">Status</div>
            <div class="result-value">Calculation logic not yet implemented</div>
        </div>
        <div class="result-item">
            <div class="result-label">Total Inputs</div>
            <div class="result-value">${Object.keys(inputs).length} parameters</div>
        </div>
    `;
}

// Format label for display
function formatLabel(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/([a-z])([A-Z])/g, '$1 $2');
}

// Show calculator modal with details
function showCalculatorModal(calculatorKey) {
    const calculator = calculators[calculatorKey];
    if (!calculator) return;

    // Update modal title and icon
    document.getElementById('modalIcon').className = `bi ${calculator.icon}`;
    document.getElementById('modalTitle').textContent = calculator.name;
    
    const calculateBtn = document.getElementById('modalCalculateBtn');
    calculateBtn.onclick = () => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('calculatorModal'));
        modal.hide();
        showCalculator(calculatorKey);
    };

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <ul class="nav nav-tabs" id="modalTab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="commentary-tab" data-bs-toggle="tab" data-bs-target="#commentary" type="button" role="tab" aria-controls="commentary" aria-selected="true">Commentary</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="history-tab" data-bs-toggle="tab" data-bs-target="#history" type="button" role="tab" aria-controls="history" aria-selected="false">History</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="notes-tab" data-bs-toggle="tab" data-bs-target="#notes" type="button" role="tab" aria-controls="notes" aria-selected="false">Notes</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="references-tab" data-bs-toggle="tab" data-bs-target="#references" type="button" role="tab" aria-controls="references" aria-selected="false">References</button>
            </li>
        </ul>
        <div class="tab-content" id="modalTabContent">
            <div class="tab-pane fade show active p-3" id="commentary" role="tabpanel" aria-labelledby="commentary-tab">
                <p class="text-cookie-brown">${calculator.commentary}</p>
            </div>
            <div class="tab-pane fade p-3" id="history" role="tabpanel" aria-labelledby="history-tab">
                <!-- History content will be loaded here -->
            </div>
            <div class="tab-pane fade p-3" id="notes" role="tabpanel" aria-labelledby="notes-tab">
                <textarea id="notes-textarea" class="form-control" rows="10" placeholder="Your notes here..."></textarea>
            </div>
            <div class="tab-pane fade p-3" id="references" role="tabpanel" aria-labelledby="references-tab">
                <div class="mb-3">
                    <strong class="text-cookie-brown">Legislative Provisions (Income Tax Act):</strong>
                    ${calculator.lawText.map(law => `
                        <div class="mt-1">
                            <a href="${law.url}" target="_blank" class="text-decoration-none">
                                <i class="bi bi-book me-1"></i>${law.text}
                            </a>
                        </div>
                    `).join('')}
                </div>
                <div>
                    <strong class="text-cookie-brown">CRA Technical Information (Folios):</strong>
                    ${calculator.craFolios.map(folio => `
                        <div class="mt-1">
                            <a href="${folio.url}" target="_blank" class="text-decoration-none text-truncate d-block">
                                <i class="bi bi-link-45deg me-1"></i>${folio.url}
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Load Notes
    const notesTextarea = document.getElementById('notes-textarea');
    notesTextarea.value = getNotes(calculatorKey);
    notesTextarea.addEventListener('input', () => {
        saveNotes(calculatorKey, notesTextarea.value);
    });

    // Load History
    loadHistoryTab(calculatorKey);
}

function loadHistoryTab(calculatorKey) {
    const historyContainer = document.getElementById('history');
    const history = getHistory(calculatorKey);

    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="text-muted">No saved calculations yet.</p>';
        return;
    }

    historyContainer.innerHTML = `
        <div class="list-group">
            ${history.map((item, index) => `
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Saved:</strong> ${new Date(item.timestamp).toLocaleString()}
                        <br>
                        <small class="text-muted">Net Tax: $${item.results.netTax ? item.results.netTax.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-cookie-brown me-2" onclick="loadCalculationFromHistory('${calculatorKey}', ${index})">
                            <i class="bi bi-box-arrow-in-down"></i> Load
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCalculationFromHistory('${calculatorKey}', ${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function loadCalculationFromHistory(calculatorKey, index) {
    const history = getHistory(calculatorKey);
    const item = history[index];

    if (item) {
        calculatorInputs[calculatorKey] = item.inputs;
        const modal = bootstrap.Modal.getInstance(document.getElementById('calculatorModal'));
        modal.hide();
        showCalculator(calculatorKey);
    }
}

function deleteCalculationFromHistory(calculatorKey, index) {
    let history = getHistory(calculatorKey);
    history.splice(index, 1);
    saveHistory(calculatorKey, history);
    loadHistoryTab(calculatorKey);
}

// =================================================================================
// LocalStorage Helper Functions
// =================================================================================

function getNotes(calculatorKey) {
    return localStorage.getItem(`cookieTaxNotes-${calculatorKey}`) || '';
}

function saveNotes(calculatorKey, content) {
    localStorage.setItem(`cookieTaxNotes-${calculatorKey}`, content);
}

function getHistory(calculatorKey) {
    const history = localStorage.getItem(`cookieTaxHistory-${calculatorKey}`);
    return history ? JSON.parse(history) : [];
}

function saveHistory(calculatorKey, historyArray) {
    localStorage.setItem(`cookieTaxHistory-${calculatorKey}`, JSON.stringify(historyArray));
}

function addToHistory(calculatorKey) {
    const history = getHistory(calculatorKey);
    const calculationData = {
        inputs: { ...calculatorInputs[calculatorKey] }, // Deep copy
        results: { ...currentResults }, // Deep copy of current results
        timestamp: new Date().toISOString()
    };
    
    // Add to the beginning of the array
    history.unshift(calculationData);

    // Keep history limited to 10 entries
    if (history.length > 10) {
        history.pop();
    }

    saveHistory(calculatorKey, history);
    // Optionally, give user feedback
    const saveBtn = document.getElementById('saveCalculationBtn');
    if(saveBtn) {
        saveBtn.innerHTML = '<i class="bi bi-check-lg"></i> Saved!';
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="bi bi-save"></i> Save Calculation';
        }, 2000);
    }
}

// Get input configuration for each calculator
function getInputConfig(calculatorKey) {
    const configs = {
        indTax: [
            { key: 'salary', label: 'Employment Income', type: 'number', icon: 'bi-briefcase', description: 'T4 employment income' },
            { key: 'eligibleDiv', label: 'Eligible Dividends', type: 'number', icon: 'bi-cash-coin', description: 'Eligible dividends received' },
            { key: 'otherIncome', label: 'Other Income', type: 'number', icon: 'bi-plus-circle', description: 'Other sources of income' },
            { key: 'age', label: 'Age', type: 'number', icon: 'bi-person', description: 'Taxpayer age' },
            { key: 'province', label: 'Province', type: 'select', icon: 'bi-geo-alt', description: 'Province of residence',
              options: [
                { value: 'QC', label: 'Quebec' },
                { value: 'ON', label: 'Ontario' },
                { value: 'BC', label: 'British Columbia' },
                { value: 'AB', label: 'Alberta' }
              ]
            },
            { key: 'notes', label: 'Notes', type: 'text', icon: 'bi-journal-text', description: 'Additional notes or assumptions' },
            { key: 'pensionIncome', label: 'Pension Income', type: 'number', icon: 'bi-piggy-bank', description: 'Pension and retirement income' },
            { key: 'deductions', label: 'Deductions', type: 'number', icon: 'bi-dash-circle', description: 'Total deductions (RRSP, union dues, etc.)' },
            { key: 'rrspDeduction', label: 'RRSP Deduction', type: 'number', icon: 'bi-piggy-bank', description: 'RRSP contribution deduction' },
            { key: 'unionDues', label: 'Union Dues', type: 'number', icon: 'bi-people', description: 'Union, professional, or like dues' },
            { key: 'employmentExpenses', label: 'Employment Expenses', type: 'number', icon: 'bi-briefcase', description: 'Employment expenses (T777)' },
            { key: 'otherDeductions', label: 'Other Deductions', type: 'number', icon: 'bi-dash-circle', description: 'Other deductions not listed above' },
            { key: 'childCareExpenses', label: 'Child Care Expenses', type: 'number', icon: 'bi-person-hearts', description: 'Child care and babysitting expenses' },
            { key: 'movingExpenses', label: 'Moving Expenses', type: 'number', icon: 'bi-truck', description: 'Moving expenses for work or study' },
            { key: 'supportPayments', label: 'Support Payments', type: 'number', icon: 'bi-heart', description: 'Spousal or child support payments' },
            { key: 'spouseAmount', label: 'Spouse Amount', type: 'number', icon: 'bi-people', description: 'Spouse or common-law partner amount' },
            { key: 'medicalExpenses', label: 'Medical Expenses', type: 'number', icon: 'bi-hospital', description: 'Medical expenses for self, spouse, or dependents' },
            { key: 'charitableDonations', label: 'Charitable Donations', type: 'number', icon: 'bi-gift', description: 'Donations and gifts to registered charities' },
            { key: 'tuitionFees', label: 'Tuition Fees', type: 'number', icon: 'bi-mortarboard', description: 'Tuition, education, and textbook amounts' },
            { key: 'transitPasses', label: 'Public Transit', type: 'number', icon: 'bi-bus-front', description: 'Public transit passes' },
            { key: 'homeAccessibility', label: 'Home Accessibility', type: 'number', icon: 'bi-house-gear', description: 'Home accessibility tax credit' }
        ],
        corpTax: [
            { key: 'abi', label: 'Active Business Income', type: 'number', icon: 'bi-building', description: 'Active business income eligible for SBD' },
            { key: 'sbdEligibility', label: 'SBD Eligibility %', type: 'number', icon: 'bi-percent', description: 'Small business deduction eligibility percentage' },
            { key: 'refundableTaxes', label: 'Refundable Taxes', type: 'number', icon: 'bi-arrow-counterclockwise', description: 'Part IV and Part I refundable taxes' },
            { key: 'rdtohBalance', label: 'RDTOH Balance', type: 'number', icon: 'bi-piggy-bank', description: 'Refundable dividend tax on hand balance' }
        ],
        corpCapGain: [
            { key: 'isCorporation', label: 'Corporation', type: 'checkbox', icon: 'bi-building', description: 'Check if this is a corporate taxpayer (uncheck for individual)' },
            { key: 'proceeds', label: 'Proceeds of Disposition', type: 'number', icon: 'bi-cash-stack', description: 'Gross proceeds from asset sale' },
            { key: 'acb', label: 'Adjusted Cost Base', type: 'number', icon: 'bi-calculator', description: 'Tax cost of the asset' },
            { key: 'outlaysExpenses', label: 'Outlays & Expenses', type: 'number', icon: 'bi-receipt', description: 'Costs of disposition (legal fees, commissions, etc.)' },
            { key: 'reserve', label: 'Reserve Claimed', type: 'number', icon: 'bi-clock-history', description: 'Reserve for proceeds not due until future year' },
            { key: 'safeIncomeBump', label: 'Safe Income Bump', type: 'number', icon: 'bi-shield-check', description: 'Available safe income per share (corporate only)', conditional: 'isCorporation' },
            { key: 'vDay', label: 'V-day Value', type: 'number', icon: 'bi-calendar-date', description: 'Valuation Day (Dec 22, 1971) value' },
            { key: 'cdaBalance', label: 'CDA Balance', type: 'number', icon: 'bi-wallet', description: 'Capital dividend account balance (corporate only)', conditional: 'isCorporation' }
        ],
        deathTax: [
            { key: 'fmvCapitalProperty', label: 'FMV of Capital Property', type: 'number', icon: 'bi-house', description: 'Fair market value of capital property' },
            { key: 'acbCapitalProperty', label: 'ACB of Capital Property', type: 'number', icon: 'bi-calculator', description: 'Adjusted cost base of capital property' },
            { key: 'fmvDepreciableProperty', label: 'FMV of Depreciable Property', type: 'number', icon: 'bi-house', description: 'Fair market value of depreciable property' },
            { key: 'costDepreciableProperty', label: 'Cost of Depreciable Property', type: 'number', icon: 'bi-calculator', description: 'Cost of depreciable property' },
            { key: 'uccDepreciableProperty', label: 'UCC of Depreciable Property', type: 'number', icon: 'bi-calculator', description: 'Unused capital cost of depreciable property' },
            { key: 'rrspRifValue', label: 'RRSP RIF Value', type: 'number', icon: 'bi-piggy-bank', description: 'RIF value of the property' },
            { key: 'otherFinalIncome', label: 'Other Final Income', type: 'number', icon: 'bi-cash-coin', description: 'Other income from the property' },
            { key: 'spousalRollover', label: 'Spousal Rollover', type: 'checkbox', icon: 'bi-heart', description: 'Elect spousal rollover' },
            { key: 'province', label: 'Province', type: 'select', icon: 'bi-geo-alt', description: 'Province of residence',
              options: [
                { value: 'QC', label: 'Quebec' },
                { value: 'ON', label: 'Ontario' },
                { value: 'BC', label: 'British Columbia' },
                { value: 'AB', label: 'Alberta' }
              ]
            }
        ],
        rollover85: [
            { key: 'propertyType', label: 'Property Type', type: 'select', icon: 'bi-house', description: 'Type of property',
              options: [
                { value: 'capital', label: 'Capital' },
                { value: 'depreciable', label: 'Depreciable' }
              ]
            },
            { key: 'fmv', label: 'Fair Market Value', type: 'number', icon: 'bi-graph-up', description: 'Fair market value of the property' },
            { key: 'acb', label: 'Adjusted Cost Base', type: 'number', icon: 'bi-calculator', description: 'Tax cost of the property' },
            { key: 'ucc', label: 'UCC', type: 'number', icon: 'bi-calculator', description: 'Unused capital cost of the property' },
            { key: 'boot', label: 'Boot', type: 'number', icon: 'bi-box', description: 'Non-share consideration received' },
            { key: 'electedAmount', label: 'Elected Amount', type: 'number', icon: 'bi-hand-index', description: 'Amount elected on Form T2057' },
            { key: 'isIndividual', label: 'Individual', type: 'checkbox', icon: 'bi-person', description: 'Check if this is an individual taxpayer' }
        ],
        departureTax: [
            { key: 'fmvNonTcp', label: 'FMV at Emigration', type: 'number', icon: 'bi-airplane-engines', description: 'Fair market value when ceasing residence' },
            { key: 'acbNonTcp', label: 'Adjusted Cost Base', type: 'number', icon: 'bi-calculator', description: 'Tax cost of the property' },
            { key: 'otherIncome', label: 'Other Income', type: 'number', icon: 'bi-cash-coin', description: 'Other income from the property' },
            { key: 'electToDefer', label: 'Elect to Defer', type: 'checkbox', icon: 'bi-calendar-check', description: 'Elect to defer departure tax' },
            { key: 'province', label: 'Province', type: 'select', icon: 'bi-geo-alt', description: 'Province of residence',
              options: [
                { value: 'QC', label: 'Quebec' },
                { value: 'ON', label: 'Ontario' },
                { value: 'BC', label: 'British Columbia' },
                { value: 'AB', label: 'Alberta' }
              ]
            }
        ],
        amt: [
            { key: 'netIncome', label: 'Net Income', type: 'number', icon: 'bi-calculator', description: 'Regular taxable income adjusted for AMT' },
            { key: 'capitalGains', label: 'Capital Gains', type: 'number', icon: 'bi-percent', description: 'Percentage of capital gains included' },
            { key: 'stockOptionBenefit', label: 'Stock Option Benefit', type: 'number', icon: 'bi-percent', description: 'Percentage of stock option benefit included' },
            { key: 'taxShelterLosses', label: 'Tax Shelter Losses', type: 'number', icon: 'bi-percent', description: 'Percentage of tax shelter losses included' },
            { key: 'disallowedDeductions', label: 'Disallowed Deductions', type: 'number', icon: 'bi-percent', description: 'Percentage of disallowed deductions included' },
            { key: 'donationCreditsClaimed', label: 'Donation Credits Claimed', type: 'number', icon: 'bi-percent', description: 'Percentage of donation credits claimed' },
            { key: 'regularTaxPayable', label: 'Regular Tax Payable', type: 'number', icon: 'bi-calculator', description: 'Regular tax payable before AMT' }
        ],
        windup88: [
            { key: 'puc', label: 'Paid-up Capital', type: 'number', icon: 'bi-cash-coin', description: 'PUC of shares being wound up' },
            { key: 'grip', label: 'GRIP Balance', type: 'number', icon: 'bi-piggy-bank', description: 'General rate income pool balance' },
            { key: 'cda', label: 'CDA Balance', type: 'number', icon: 'bi-wallet', description: 'Capital dividend account balance' },
            { key: 'nerdtoh', label: 'Non-eligible RDTOH', type: 'number', icon: 'bi-arrow-counterclockwise', description: 'Non-eligible refundable dividend tax' },
            { key: 'rdtoh', label: 'Eligible RDTOH', type: 'number', icon: 'bi-arrow-repeat', description: 'Eligible refundable dividend tax' }
        ]
    };
    
    return configs[calculatorKey] || [];
}

// ------------------------------------------------------------
// Custom result renderer for Individual Tax
// ------------------------------------------------------------
function displayIndTaxResults(results) {
    const container = document.getElementById('outputDisplay');
    const headerActions = document.getElementById('outputDisplayHeaderActions');

    if (!results || Object.keys(results).length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calculator display-4 text-muted"></i>
                <p class="text-muted mt-2">Enter values to see calculations</p>
            </div>
        `;
        headerActions.innerHTML = '';
        return;
    }

    // Header buttons
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm me-2" onclick="showCalculatorModal('indTax')" data-bs-toggle="modal" data-bs-target="#calculatorModal">
            <i class="bi bi-info-circle"></i> <span class="d-none d-md-inline">Details</span>
        </button>
        <button id="saveCalculationBtn" class="btn btn-sm btn-cookie-brown" onclick="addToHistory(currentCalculator)">
            <i class="bi bi-save"></i> <span class="d-none d-md-inline">Save</span>
        </button>`;
    
    container.innerHTML = ''; // Clear container before adding table

    // Build responsive table
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';

    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless align-middle';

    const addSectionHeader = (title) => {
        const tr = document.createElement('tr');
        tr.className = 'table-light';
        tr.innerHTML = `<th colspan="2" class="fw-semibold">${title}</th>`;
        tbody.appendChild(tr);
    };

    const addRow = (label, value, isCurrency = true, isPercent = false) => {
        if (value === undefined || value === null) return;
        const tr = document.createElement('tr');
        const formatted = typeof value === 'number' ?
            (isPercent ? `${(value * 100).toFixed(2)}%` : `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
            : value;
        tr.innerHTML = `<td>${label}</td><td class="text-end">${formatted}</td>`;
        tbody.appendChild(tr);
    };

    const tbody = document.createElement('tbody');

    // SECTION: Taxable Income & Tax Calculation
    addSectionHeader('Taxable Income & Tax Calculation');
    addRow('Taxable Income', results.taxableIncome);
    addRow('Federal tax (before credits)', results.federalTax + results.federalCredits + (results.quebecAbatement || 0));
    addRow('Provincial tax (before credits)', results.provincialTax + results.provincialCredits - (results.quebecAbatement || 0));
    addRow('Total non-refundable credits', results.federalCredits + results.provincialCredits);
    addRow('Net Federal Tax', results.federalTax);
    addRow('Net Provincial Tax', results.provincialTax);
    addRow('Total Net Tax', results.netTax);

    // Add bracket calculation details
    if (results.taxableIncome > 0) {
        addSectionHeader('Tax Bracket Breakdown');
        const federalBreakdown = calculateTaxBreakdown(results.taxableIncome, taxRates.fed, 'Federal');
        const provincialBreakdown = calculateTaxBreakdown(results.taxableIncome, taxRates.qc, 'Quebec');
        
        federalBreakdown.forEach(bracket => {
            if (bracket.taxOnBracket > 0) {
                addRow(`Federal: $${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()} @ ${(bracket.rate * 100).toFixed(1)}%`, bracket.taxOnBracket);
            }
        });
        
        provincialBreakdown.forEach(bracket => {
            if (bracket.taxOnBracket > 0) {
                addRow(`Quebec: $${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()} @ ${(bracket.rate * 100).toFixed(1)}%`, bracket.taxOnBracket);
            }
        });
    }

    // Quebec abatement display
    if (results.quebecAbatement) {
        addSectionHeader('Quebec Abatement');
        addRow('Quebec abatement (16.5% of federal tax)', -results.quebecAbatement);
    }

    // SECTION: Final Summary
    addSectionHeader('Summary');
    addRow('Total tax paid', results.netTax);
    addRow('After-tax income', results.afterTaxIncome);
    addRow('Marginal tax rate', results.marginalRate, false, true);
    // Fix effective rate calculation - should be total tax / total income
    const effectiveRate = results.totalIncome > 0 ? results.netTax / results.totalIncome : 0;
    addRow('Effective tax rate', effectiveRate, false, true);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// ------------------------------------------------------------
// Custom result renderer for Corporate Tax
// ------------------------------------------------------------
function displayCorpTaxResults(results) {
    const container = document.getElementById('outputDisplay');
    const headerActions = document.getElementById('outputDisplayHeaderActions');

    if (!results || Object.keys(results).length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calculator display-4 text-muted"></i>
                <p class="text-muted mt-2">Enter values to see calculations</p>
            </div>
        `;
        headerActions.innerHTML = '';
        return;
    }

    // Header buttons
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm me-2" onclick="showCalculatorModal('corpTax')" data-bs-toggle="modal" data-bs-target="#calculatorModal">
            <i class="bi bi-info-circle"></i> <span class="d-none d-md-inline">Details</span>
        </button>
        <button id="saveCalculationBtn" class="btn btn-sm btn-cookie-brown" onclick="addToHistory(currentCalculator)">
            <i class="bi bi-save"></i> <span class="d-none d-md-inline">Save</span>
        </button>`;
    
    container.innerHTML = '';

    // Build responsive table
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';

    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless align-middle';

    const addSectionHeader = (title) => {
        const tr = document.createElement('tr');
        tr.className = 'table-light';
        tr.innerHTML = `<th colspan="2" class="fw-semibold">${title}</th>`;
        tbody.appendChild(tr);
    };

    const addRow = (label, value, isCurrency = true, isPercent = false) => {
        if (value === undefined || value === null) return;
        const tr = document.createElement('tr');
        const formatted = typeof value === 'number' ?
            (isPercent ? `${(value * 100).toFixed(2)}%` : `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
            : value;
        tr.innerHTML = `<td>${label}</td><td class="text-end">${formatted}</td>`;
        tbody.appendChild(tr);
    };

    const tbody = document.createElement('tbody');

    // SECTION: Income Allocation & Tax Calculation
    addSectionHeader('Income Allocation & Tax Calculation');
    addRow('Taxable income', results.taxableIncome);
    addRow('SBD eligible income', results.sbdEligibleIncome);
    addRow('General rate income', results.generalRateIncome);
    addRow('Investment income', results.investmentIncome);
    addRow('SBD limit (after passive income)', results.sbdLimit);

    // Tax calculations by type
    addSectionHeader('Tax Calculations by Income Type');
    addRow('Federal SBD tax (9%)', results.federalSBDTax);
    addRow('Provincial SBD tax', results.provincialSBDTax);
    addRow('Federal general rate tax (27%)', results.federalGeneralTax);
    addRow('Provincial general rate tax', results.provincialGeneralTax);
    if (results.investmentIncome > 0) {
        addRow('Federal investment tax (38⅔%)', results.federalInvestmentTax);
        addRow('Provincial investment tax', results.provincialInvestmentTax);
    }

    // Total taxes
    addSectionHeader('Total Tax Summary');
    addRow('Total federal tax', results.totalFederalTax);
    addRow('Total provincial tax', results.totalProvincialTax);
    addRow('Total corporate tax', results.totalTax);
    addRow('Effective tax rate', results.effectiveTaxRate, false, true);
    addRow('After-tax income', results.afterTaxIncome);

    // Refundable taxes (if any)
    if (results.totalRefundableTax > 0) {
        addSectionHeader('Refundable Taxes');
        addRow('Federal refundable portion', results.refundablePortionFederal);
        addRow('Provincial refundable portion', results.refundablePortionProvincial);
        addRow('Total refundable tax', results.totalRefundableTax);
    }

    // Account updates
    addSectionHeader('Account Balance Updates');
    if (results.rdtohEligibleAddition > 0) {
        addRow('RDTOH (Eligible) addition', results.rdtohEligibleAddition);
        addRow('New RDTOH (Eligible) balance', results.newRdtohEligible);
    }
    if (results.rdtohNonEligibleAddition > 0) {
        addRow('RDTOH (Non-eligible) addition', results.rdtohNonEligibleAddition);
        addRow('New RDTOH (Non-eligible) balance', results.newRdtohNonEligible);
    }
    if (results.gripAddition > 0) {
        addRow('GRIP addition', results.gripAddition);
        addRow('New GRIP balance', results.newGrip);
    }
    if (results.lripAddition > 0) {
        addRow('LRIP addition', results.lripAddition);
        addRow('New LRIP balance', results.newLrip);
    }
    if (results.cdaAddition > 0) {
        addRow('CDA addition', results.cdaAddition);
        addRow('New CDA balance', results.newCda);
    }

    // Combined rates summary
    addSectionHeader('Combined Tax Rates');
    addRow('Combined SBD rate', results.combinedSBDRate, false, true);
    addRow('Combined general rate', results.combinedGeneralRate, false, true);
    if (results.investmentIncome > 0) {
        addRow('Combined investment rate', results.combinedInvestmentRate, false, true);
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// ------------------------------------------------------------
// Custom result renderer for Capital Gains
// ------------------------------------------------------------
function displayCapGainResults(results) {
    const container = document.getElementById('outputDisplay');
    const headerActions = document.getElementById('outputDisplayHeaderActions');

    if (!results || Object.keys(results).length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calculator display-4 text-muted"></i>
                <p class="text-muted mt-2">Enter values to see calculations</p>
            </div>
        `;
        headerActions.innerHTML = '';
        return;
    }

    // Header buttons
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm me-2" onclick="showCalculatorModal('corpCapGain')" data-bs-toggle="modal" data-bs-target="#calculatorModal">
            <i class="bi bi-info-circle"></i> <span class="d-none d-md-inline">Details</span>
        </button>
        <button id="saveCalculationBtn" class="btn btn-sm btn-cookie-brown" onclick="addToHistory(currentCalculator)">
            <i class="bi bi-save"></i> <span class="d-none d-md-inline">Save</span>
        </button>`;

    container.innerHTML = '';

    // Build responsive table
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';

    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless align-middle';

    const addSectionHeader = (title) => {
        const tr = document.createElement('tr');
        tr.className = 'table-light';
        tr.innerHTML = `<th colspan="2" class="fw-semibold">${title}</th>`;
        tbody.appendChild(tr);
    };

    const addRow = (label, value, isCurrency = true, isPercent = false) => {
        if (value === undefined || value === null) return;
        const tr = document.createElement('tr');
        const formatted = typeof value === 'number' ?
            (isPercent ? `${(value * 100).toFixed(2)}%` : `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
            : value;
        tr.innerHTML = `<td>${label}</td><td class="text-end">${formatted}</td>`;
        tbody.appendChild(tr);
    };

    const tbody = document.createElement('tbody');

    // Transaction Summary
    addSectionHeader('Transaction Summary');
    addRow('Taxpayer type', results.isCorporation ? 'Corporation' : 'Individual', false);
    addRow('Proceeds of disposition', results.proceeds);
    if (results.outlaysExpenses > 0) {
        addRow('Outlays and expenses', results.outlaysExpenses);
        addRow('Net proceeds', results.netProceeds);
    }
    addRow('Adjusted cost base (ACB)', results.acb);

    // Gain Calculation
    addSectionHeader('Capital Gain Calculation');
    addRow('Gross capital gain', results.grossGain);
    if (results.vDayAdjustment > 0) {
        addRow('V-day value adjustment', results.vDayAdjustment);
    }
    if (results.safeIncomeBumpTotal > 0) {
        addRow('Safe income bump (s.55)', results.safeIncomeBumpTotal);
    }
    if (results.reserve > 0) {
        addRow('Reserve claimed', results.reserve);
    }
    addRow('Net capital gain', results.capitalGain);
    addRow('Taxable capital gain (50%)', results.taxableCapitalGain);
    if (results.isCorporation) {
        addRow('Non-taxable portion (50%)', results.nonTaxableCapitalGain);
    }

    // Tax calculations
    if (results.isCorporation) {
        addSectionHeader('Corporate Tax Implications');
        addRow('Corporate tax on gain', results.corporateTax);
        addRow('Refundable tax portion', results.refundableTax);
        addRow('After-tax corporate income', results.afterTaxCorporateIncome);
        
        if (results.cdaAddition > 0) {
            addSectionHeader('Account Updates');
            addRow('CDA addition', results.cdaAddition);
            addRow('New CDA balance', results.newCdaBalance);
        }
        if (results.rdtohEligibleAddition > 0) {
            addRow('RDTOH (Eligible) addition', results.rdtohEligibleAddition);
            addRow('New RDTOH (Eligible) balance', results.newRdtohEligible);
        }
    } else {
        addSectionHeader('Individual Tax Implications');
        addRow('Marginal tax rate', results.marginalRate, false, true);
        addRow('Tax on capital gain', results.taxOnGain);
        addRow('Effective rate on gain', results.effectiveRate, false, true);
        addRow('After-tax proceeds', results.afterTaxProceeds);
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// ------------------------------------------------------------
// Custom result renderer for Death Tax
// ------------------------------------------------------------
function displayDeathTaxResults(results) {
    const container = document.getElementById('outputDisplay');
    const headerActions = document.getElementById('outputDisplayHeaderActions');

    if (!results || Object.keys(results).length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calculator display-4 text-muted"></i>
                <p class="text-muted mt-2">Enter values to see calculations</p>
            </div>
        `;
        headerActions.innerHTML = '';
        return;
    }

    // Header buttons
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm me-2" onclick="showCalculatorModal('deathTax')" data-bs-toggle="modal" data-bs-target="#calculatorModal">
            <i class="bi bi-info-circle"></i> <span class="d-none d-md-inline">Details</span>
        </button>
        <button id="saveCalculationBtn" class="btn btn-sm btn-cookie-brown" onclick="addToHistory(currentCalculator)">
            <i class="bi bi-save"></i> <span class="d-none d-md-inline">Save</span>
        </button>`;

    container.innerHTML = '';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';

    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless align-middle';

    const tbody = document.createElement('tbody');

    const addSectionHeader = (title) => {
        const tr = document.createElement('tr');
        tr.className = 'table-light';
        tr.innerHTML = `<th colspan="2" class="fw-semibold">${title}</th>`;
        tbody.appendChild(tr);
    };

    const addRow = (label, value, isCurrency = true, isPercent = false) => {
        if (value === undefined || value === null) return;
        const tr = document.createElement('tr');
        const formatted = typeof value === 'number' ?
            (isPercent ? `${(value * 100).toFixed(2)}%` : `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
            : value;
        tr.innerHTML = `<td>${label}</td><td class="text-end">${formatted}</td>`;
        tbody.appendChild(tr);
    };

    if (results.spousalRolloverElected) {
        addSectionHeader('Spousal Rollover Elected');
        addRow('Note', results.note, false);
        addRow('Total Tax on Final Return', results.totalTaxOnFinalReturn);
    } else {
        addSectionHeader('Income on Final Return');
        if (results.taxableCapitalGain > 0) addRow('Taxable Capital Gain (Shares, etc.)', results.taxableCapitalGain);
        if (results.recapture > 0) addRow('Recapture (Depreciable Property)', results.recapture);
        if (results.taxableCapitalGainDepreciable > 0) addRow('Taxable Capital Gain (Depreciable Property)', results.taxableCapitalGainDepreciable);
        if (results.rrspIncome > 0) addRow('RRSP/RRIF Income', results.rrspIncome);
        addRow('Total Deemed Disposition Income', results.deemedDispositionIncome, true);
        addRow('Other Income', results.otherFinalIncome, true);
        addRow('Total Income on Final Return', results.totalIncomeOnFinalReturn, true);

        addSectionHeader('Tax Liability');
        addRow('Net Federal Tax', results.netFederalTax);
        if (results.quebecAbatement > 0) addRow('Quebec Abatement', -results.quebecAbatement);
        addRow('Net Provincial Tax', results.netProvincialTax);
        addRow('Total Tax on Final Return', results.totalTaxOnFinalReturn);
        addRow('Portion Attributable to Deemed Disposition', results.taxOnDeemedDisposition);
    }
    
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// ------------------------------------------------------------
// Custom result renderer for Section 85 Rollover
// ------------------------------------------------------------
function displayRollover85Results(results) {
    const container = document.getElementById('outputDisplay');
    const headerActions = document.getElementById('outputDisplayHeaderActions');

    if (!results || Object.keys(results).length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calculator display-4 text-muted"></i>
                <p class="text-muted mt-2">Enter values to see calculations</p>
            </div>
        `;
        headerActions.innerHTML = '';
        return;
    }

    // Header buttons
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm me-2" onclick="showCalculatorModal('rollover85')" data-bs-toggle="modal" data-bs-target="#calculatorModal">
            <i class="bi bi-info-circle"></i> <span class="d-none d-md-inline">Details</span>
        </button>
        <button id="saveCalculationBtn" class="btn btn-sm btn-cookie-brown" onclick="addToHistory(currentCalculator)">
            <i class="bi bi-save"></i> <span class="d-none d-md-inline">Save</span>
        </button>`;
    container.innerHTML = '';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';

    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless align-middle';

    const tbody = document.createElement('tbody');

    const addSectionHeader = (title) => {
        const tr = document.createElement('tr');
        tr.className = 'table-light';
        tr.innerHTML = `<th colspan="2" class="fw-semibold">${title}</th>`;
        tbody.appendChild(tr);
    };

    const addRow = (label, value, isCurrency = true) => {
        if (value === undefined || value === null) return;
        const tr = document.createElement('tr');
        const formatted = typeof value === 'number' && isCurrency ?
            `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : value;
        tr.innerHTML = `<td>${label}</td><td class="text-end">${formatted}</td>`;
        tbody.appendChild(tr);
    };

    addSectionHeader('Election Summary');
    addRow('Elected Amount', results.electedAmount);
    addRow('Valid Election Range', results.validRange, false);

    addSectionHeader("Transferor's Tax Consequences");
    addRow('Proceeds of Disposition', results.proceeds);
    if (results.incomeInclusion > 0) {
        addRow(results.inclusionType, results.incomeInclusion);
    } else {
        addRow('Immediate Income/Gain', 0);
    }
    addRow('ACB of Shares Received', results.sharesAcb);
    if (results.deemedDividend84_1) {
        addRow('Section 84.1 Note', results.deemedDividend84_1, false);
    }

    addSectionHeader("Corporation's Tax Consequences");
    addRow('Cost of Property Acquired', results.corpPropertyCost);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// ------------------------------------------------------------
// Custom result renderer for Departure Tax
// ------------------------------------------------------------
function displayDepartureTaxResults(results) {
    const container = document.getElementById('outputDisplay');
    const headerActions = document.getElementById('outputDisplayHeaderActions');

    if (!results || Object.keys(results).length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-calculator display-4 text-muted"></i>
                <p class="text-muted mt-2">Enter values to see calculations</p>
            </div>
        `;
        headerActions.innerHTML = '';
        return;
    }

    // Header buttons
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm me-2" onclick="showCalculatorModal('departureTax')" data-bs-toggle="modal" data-bs-target="#calculatorModal">
            <i class="bi bi-info-circle"></i> <span class="d-none d-md-inline">Details</span>
        </button>
        <button id="saveCalculationBtn" class="btn btn-sm btn-cookie-brown" onclick="addToHistory(currentCalculator)">
            <i class="bi bi-save"></i> <span class="d-none d-md-inline">Save</span>
        </button>`;
    container.innerHTML = '';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';

    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless align-middle';

    const tbody = document.createElement('tbody');

    const addSectionHeader = (title) => {
        const tr = document.createElement('tr');
        tr.className = 'table-light';
        tr.innerHTML = `<th colspan="2" class="fw-semibold">${title}</th>`;
        tbody.appendChild(tr);
    };

    const addRow = (label, value, isCurrency = true) => {
        if (value === undefined || value === null) return;
        const tr = document.createElement('tr');
        const formatted = typeof value === 'number' && isCurrency ?
            `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value);
        tr.innerHTML = `<td>${label}</td><td class="text-end">${formatted}</td>`;
        tbody.appendChild(tr);
    };

    addSectionHeader('Departure Tax Calculation');
    addRow('Capital Gain on Deemed Disposition', results.capitalGain);
    addRow('Taxable Capital Gain (50%)', results.taxableCapitalGain);
    addRow('Total Income in Year of Departure', results.totalIncomeInYearOfDeparture);
    addRow('<strong>Departure Tax Liability</strong>', results.departureTaxLiability);

    addSectionHeader('Deferral Election');
    addRow('Tax Deferred', results.taxDeferred);
    addRow('Security Required by CRA', results.securityRequired, false);
    addRow('Note', results.note, false);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// ------------------------------------------------------------
// Custom result renderer for Alternative Minimum Tax (AMT)
// ------------------------------------------------------------
function displayAmtResults(results) {
    const container = document.getElementById('outputDisplay');
    const headerActions = document.getElementById('outputDisplayHeaderActions');

    if (!results || Object.keys(results).length === 0) {
        headerActions.innerHTML = '';
        container.innerHTML = `<div class="text-center py-4"><i class="bi bi-calculator display-4 text-muted"></i><p class="text-muted mt-2">Enter values to see calculations</p></div>`;
        return;
    }

    // Header buttons
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm me-2" onclick="showCalculatorModal('amt')" data-bs-toggle="modal" data-bs-target="#calculatorModal">
            <i class="bi bi-info-circle"></i> <span class="d-none d-md-inline">Details</span>
        </button>
        <button id="saveCalculationBtn" class="btn btn-sm btn-cookie-brown" onclick="addToHistory(currentCalculator)">
            <i class="bi bi-save"></i> <span class="d-none d-md-inline">Save</span>
        </button>`;
    container.innerHTML = '';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';
    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless align-middle';
    const tbody = document.createElement('tbody');

    const addSectionHeader = (title) => {
        const tr = document.createElement('tr');
        tr.className = 'table-light';
        tr.innerHTML = `<th colspan="2" class="fw-semibold">${title}</th>`;
        tbody.appendChild(tr);
    };

    const addRow = (label, value, isCurrency = true, isPercent = false) => {
        if (value === undefined || value === null) return;
        const tr = document.createElement('tr');
        const formatted = typeof value === 'number' ?
            (isPercent ? `${(value * 100).toFixed(2)}%` : `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
            : value;
        tr.innerHTML = `<td>${label}</td><td class="text-end">${formatted}</td>`;
        tbody.appendChild(tr);
    };

    addSectionHeader('AMT Base Calculation');
    addRow('Adjusted Taxable Income for AMT', results.amtBase);
    addRow('Less: AMT Exemption', -results.amtExemption);
    addRow('<strong>AMT Taxable Base</strong>', results.amtTaxableBase);

    addSectionHeader('Federal Minimum Tax');
    addRow('Gross Federal AMT (at 20.5%)', results.grossFederalAmt);
    addRow('Less: Allowed Federal Credits', -results.totalFederalAmtCredits);
    if (results.province === 'QC') {
        addRow('Less: Quebec Abatement (16.5%)', -results.quebecAbatement);
    }
    addRow('<strong>Net Federal Minimum Tax</strong>', results.finalFederalNetMinimumTax);

    if (results.province === 'QC') {
        addSectionHeader('Quebec Minimum Tax');
        addRow('Gross Quebec AMT (at 19%)', results.grossProvincialAmt);
        addRow('Less: Allowed Quebec Credits', -results.totalProvincialAmtCredits);
        addRow('<strong>Net Quebec Minimum Tax</strong>', results.provincialNetMinimumTax);
    }

    addSectionHeader('Final AMT Payable');
    addRow('Total Net Minimum Tax', results.netMinimumTax);
    addRow('Less: Regular Federal Tax', -results.regularTaxPayable);
    addRow('<strong>AMT Payable</strong>', results.amtPayable);
    addRow('Minimum Tax Carryover', results.minimumTaxCarryover);
    addRow('Effective Combined AMT Rate', results.effectiveCombinedRate, false, true);


    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// ------------------------------------------------------------
// Custom result renderer for Wind-up (s.88)
// ------------------------------------------------------------
function displayWindup88Results(results) {
    const container = document.getElementById('outputDisplay');
    const headerActions = document.getElementById('outputDisplayHeaderActions');

    if (!results || Object.keys(results).length === 0) {
        headerActions.innerHTML = '';
        container.innerHTML = `<div class="text-center py-4"><i class="bi bi-calculator display-4 text-muted"></i><p class="text-muted mt-2">Enter values to see calculations</p></div>`;
        return;
    }

    // Header buttons
    headerActions.innerHTML = `
        <button class="btn btn-outline-cookie-brown btn-sm me-2" onclick="showCalculatorModal('windup88')" data-bs-toggle="modal" data-bs-target="#calculatorModal">
            <i class="bi bi-info-circle"></i> <span class="d-none d-md-inline">Details</span>
        </button>
        <button id="saveCalculationBtn" class="btn btn-sm btn-cookie-brown" onclick="addToHistory(currentCalculator)">
            <i class="bi bi-save"></i> <span class="d-none d-md-inline">Save</span>
        </button>`;
    container.innerHTML = '';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'table-responsive';
    const table = document.createElement('table');
    table.className = 'table table-sm table-borderless align-middle';
    const tbody = document.createElement('tbody');

    const addSectionHeader = (title) => {
        const tr = document.createElement('tr');
        tr.className = 'table-light';
        tr.innerHTML = `<th colspan="2" class="fw-semibold">${title}</th>`;
        tbody.appendChild(tr);
    };

    const addRow = (label, value, isCurrency = true) => {
        if (value === undefined || value === null) return;
        const tr = document.createElement('tr');
        const formatted = typeof value === 'number' && isCurrency ?
            `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : value;
        tr.innerHTML = `<td>${label}</td><td class="text-end">${formatted}</td>`;
        tbody.appendChild(tr);
    };
    
    addSectionHeader('Deemed Dividend to Parent');
    addRow('Total Deemed Dividend', results.deemedDividend);
    addRow('&nbsp;&nbsp;&nbsp;Capital Dividend (tax-free)', results.cdaDividend);
    addRow('&nbsp;&nbsp;&nbsp;Eligible Dividend (from GRIP)', results.gripDividend);
    addRow('&nbsp;&nbsp;&nbsp;Taxable Dividend', results.taxableDividend);
    
    addSectionHeader("Parent's Share Disposition");
    addRow('Proceeds (No Gain/Loss)', results.parentProceedsOnShares);

    addSectionHeader('Asset Bump (s.88(1)(d))');
    addRow('Bump Limit', results.bumpLimit);
    addRow('Available Bump', results.availableBump);
    addRow('New Cost of Asset to Parent', results.newAssetCostForParent);

    if (results.note) {
        addSectionHeader('Notes');
        const noteRow = document.createElement('tr');
        noteRow.innerHTML = `<td colspan="2" class="text-muted small">${results.note}</td>`;
        tbody.appendChild(noteRow);
    }

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);
}

// Calculate tax breakdown by bracket
function calculateTaxBreakdown(income, brackets, label) {
    const breakdown = [];
    let remainingIncome = income;
    
    for (const bracket of brackets) {
        if (remainingIncome <= 0) break;
        
        const bracketIncome = Math.min(remainingIncome, bracket.max - bracket.min);
        const taxOnBracket = bracketIncome * bracket.rate;
        
        breakdown.push({
            label: label,
            min: bracket.min,
            max: bracket.max,
            rate: bracket.rate,
            incomeInBracket: bracketIncome,
            taxOnBracket: taxOnBracket
        });
        
        remainingIncome -= bracketIncome;
        if (remainingIncome <= 0) break;
    }
    
    return breakdown;
} 