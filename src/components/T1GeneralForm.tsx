import React, { useState } from 'react';
import { useScenarioStore } from '@/stores/useScenarioStore';
import T1QuizModal from './T1QuizModal';

interface T1Section {
  title: string;
  lines: T1Line[];
  schedule?: string;
}

interface T1Line {
  number: string;
  description: string;
  field: string;
  type: 'currency' | 'text' | 'checkbox' | 'select' | 'percentage';
  options?: { value: string; label: string }[];
  help?: string;
  calculation?: string;
}

const t1Sections: T1Section[] = [
  {
    title: "Identification and Personal Information",
    lines: [
      { number: "SIN", description: "Social Insurance Number", field: "sin", type: "text", help: "Your 9-digit SIN" },
      { number: "", description: "First Name", field: "firstName", type: "text" },
      { number: "", description: "Last Name", field: "lastName", type: "text" },
      { number: "", description: "Date of Birth", field: "dateOfBirth", type: "text" },
      { number: "", description: "Marital Status", field: "maritalStatus", type: "select", 
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married" },
          { value: "common_law", label: "Common-law partner" },
          { value: "divorced", label: "Divorced" },
          { value: "separated", label: "Separated" },
          { value: "widowed", label: "Widowed" }
        ]
      }
    ]
  },
  {
    title: "Total Income",
    lines: [
      { number: "10100", description: "Employment income", field: "salary", type: "currency", 
        help: "Enter your total employment income from all T4 slips" },
      { number: "10120", description: "Commissions", field: "commissions", type: "currency" },
      { number: "10400", description: "Other employment income", field: "otherEmploymentIncome", type: "currency" },
      { number: "11300", description: "Old Age Security pension", field: "oasPension", type: "currency" },
      { number: "11400", description: "CPP or QPP benefits", field: "cppBenefits", type: "currency" },
      { number: "11500", description: "Other pensions and superannuation", field: "pensionIncome", type: "currency" },
      { number: "11600", description: "Elected split-pension amount", field: "splitPensionAmount", type: "currency" },
      { number: "11700", description: "Universal Child Care Benefit", field: "uccb", type: "currency" },
      { number: "11900", description: "Employment Insurance benefits", field: "employmentInsuranceBenefits", type: "currency" },
      { number: "12000", description: "Taxable amount of dividends", field: "eligibleDiv", type: "currency", 
        help: "Enter the grossed-up amount of eligible dividends" },
      { number: "12010", description: "Other than eligible dividends", field: "nonEligibleDiv", type: "currency" },
      { number: "12100", description: "Interest and other investment income", field: "otherIncome", type: "currency" },
      { number: "12200", description: "Net partnership income", field: "partnershipIncome", type: "currency" },
      { number: "12500", description: "Rental income", field: "rentalIncome", type: "currency" },
      { number: "12600", description: "Taxable capital gains", field: "capitalGains", type: "currency", 
        help: "Enter 50% of your capital gains from Schedule 3" },
      { number: "12700", description: "Support payments received", field: "supportReceived", type: "currency" },
      { number: "12799", description: "RRSP income", field: "rrspIncome", type: "currency" },
      { number: "12800", description: "Other income", field: "otherIncomeGeneral", type: "currency" },
      { number: "12900", description: "Self-employment income", field: "businessIncome", type: "currency" },
      { number: "13000", description: "Professional income", field: "professionalIncome", type: "currency" },
      { number: "13500", description: "Foreign income", field: "foreignIncome", type: "currency" },
      { number: "15000", description: "Total income", field: "totalIncome", type: "currency", 
        calculation: "Sum of lines 10100 to 13500" }
    ]
  },
  {
    title: "Net Income",
    lines: [
      { number: "20600", description: "Pension adjustment", field: "pensionAdjustment", type: "currency" },
      { number: "20700", description: "RRSP/PRPP deduction", field: "rrspContribution", type: "currency", 
        help: "Maximum contribution based on your RRSP deduction limit" },
      { number: "20800", description: "Pooled registered pension plan", field: "prppContribution", type: "currency" },
      { number: "21000", description: "Split-pension deduction", field: "splitPensionDeduction", type: "currency" },
      { number: "21200", description: "Annual union, professional dues", field: "unionDues", type: "currency" },
      { number: "21300", description: "Child care expenses", field: "childCareExpenses", type: "currency" },
      { number: "21400", description: "Disability supports deduction", field: "disabilitySupports", type: "currency" },
      { number: "21500", description: "Business investment loss", field: "businessInvestmentLoss", type: "currency" },
      { number: "21600", description: "Moving expenses", field: "movingExpenses", type: "currency" },
      { number: "21700", description: "Support payments made", field: "supportPayments", type: "currency" },
      { number: "21900", description: "Carrying charges and interest", field: "carryingCharges", type: "currency" },
      { number: "22000", description: "CPP/QPP contributions on self-employment", field: "cppSelfEmployed", type: "currency" },
      { number: "22100", description: "Exploration and development expenses", field: "explorationExpenses", type: "currency" },
      { number: "22200", description: "Other employment expenses", field: "employmentExpenses", type: "currency" },
      { number: "22215", description: "Clergy residence deduction", field: "clergyResidence", type: "currency" },
      { number: "22300", description: "Other deductions", field: "otherDeductions", type: "currency" },
      { number: "23200", description: "Total deductions", field: "totalDeductions", type: "currency", 
        calculation: "Sum of lines 20600 to 22300" },
      { number: "23600", description: "Net income", field: "netIncome", type: "currency", 
        calculation: "Line 15000 minus line 23200" }
    ]
  },
  {
    title: "Taxable Income",
    lines: [
      { number: "24400", description: "Workers' compensation benefits", field: "workersCompensation", type: "currency" },
      { number: "24500", description: "Social assistance payments", field: "socialAssistance", type: "currency" },
      { number: "24600", description: "Net federal supplements", field: "federalSupplements", type: "currency" },
      { number: "25000", description: "Other payments deduction", field: "otherPaymentsDeduction", type: "currency" },
      { number: "25100", description: "Limited partnership losses", field: "limitedPartnershipLosses", type: "currency" },
      { number: "25200", description: "Non-capital losses", field: "nonCapitalLosses", type: "currency" },
      { number: "25300", description: "Net capital losses", field: "netCapitalLossCarryforward", type: "currency" },
      { number: "25400", description: "Capital gains deduction", field: "capitalGainsDeduction", type: "currency" },
      { number: "25500", description: "Northern residents deductions", field: "northernResidents", type: "currency" },
      { number: "25600", description: "Additional deductions", field: "additionalDeductions", type: "currency" },
      { number: "26000", description: "Total deductions", field: "totalTaxableDeductions", type: "currency", 
        calculation: "Sum of lines 24400 to 25600" },
      { number: "260", description: "Taxable income", field: "taxableIncome", type: "currency", 
        calculation: "Line 23600 minus line 26000" }
    ]
  }
];

const scheduleComponents = {
  'Schedule3': 'Capital Gains/Losses',
  'Schedule4': 'Investment Income',
  'Schedule7': 'RRSP Contributions',
  'Schedule9': 'Donations and Gifts',
  'T2125': 'Business Income',
  'T776': 'Rental Income'
};

export default function T1GeneralForm() {
  const { inputs, setField } = useScenarioStore();
  const [showQuiz, setShowQuiz] = useState(false);
  const [activeSchedules, setActiveSchedules] = useState<string[]>(['basic']);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Total Income']));
  const [mandatorySections, setMandatorySections] = useState<Set<string>>(new Set());

  const currentInputs = inputs.indTax || {};

  const handleQuizComplete = (schedules: string[], prefilledData: any) => {
    setActiveSchedules(schedules);
    
    // Determine mandatory sections based on prefilled data
    const mandatory = new Set<string>();
    if (prefilledData.salary > 0) mandatory.add('Total Income');
    if (prefilledData.rrspContribution > 0 || prefilledData.unionDues > 0) mandatory.add('Deductions from Total Income');
    if (prefilledData.medicalExpenses > 0 || prefilledData.charitableDonations > 0) mandatory.add('Non-refundable Tax Credits');
    
    setMandatorySections(mandatory);
    
    // Auto-expand mandatory sections
    setExpandedSections(new Set([...expandedSections, ...mandatory]));
    
    // Prefill form with quiz data
    Object.entries(prefilledData).forEach(([field, value]) => {
      setField('indTax', field as any, value as string | number | boolean);
    });
  };

  const handleFieldChange = (field: string, value: string | number | boolean) => {
    setField('indTax', field as any, value);
  };

  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const calculateTotals = () => {
    // This would contain the calculation logic for totals
    // For now, just return some basic calculations
    return {
      totalIncome: (currentInputs.salary || 0) + (currentInputs.eligibleDiv || 0) + (currentInputs.otherIncome || 0),
      totalDeductions: (currentInputs.rrspContribution || 0) + (currentInputs.unionDues || 0),
      netIncome: 0 // Would be calculated
    };
  };

  const totals = calculateTotals();

  return (
    <div className="t1-general-form">
      {/* Header */}
      <div className="card border-0 bg-cookie-cream mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="text-cookie-brown mb-2">
                <i className="bi bi-file-earmark-text me-2"></i>
                T1 General - Income Tax and Benefit Return
              </h4>
              <p className="text-cookie-brown opacity-75 mb-0">
                🇨🇦 Canada Revenue Agency • Tax Year 2024
              </p>
            </div>
            <div className="text-end">
              <button 
                className="btn btn-cookie-primary me-2"
                onClick={() => setShowQuiz(true)}
              >
                <i className="bi bi-clipboard-check me-2"></i>
                Setup Quiz
              </button>
              <div className="mt-2">
                <small className="text-cookie-brown">
                  <i className="bi bi-calendar me-1"></i>
                  Due: April 30, 2025
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Schedules */}
      {activeSchedules.length > 1 && (
        <div className="mb-3">
          <div className="d-flex flex-wrap gap-2">
            {activeSchedules.map(schedule => (
              <span key={schedule} className="badge bg-secondary text-white px-3 py-2">
                <i className="bi bi-file-earmark me-2"></i>
                {schedule}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* T1 Form Sections */}
      {t1Sections.map((section, sectionIndex) => {
        const hasData = section.lines.some(line => (currentInputs as any)[line.field] > 0);
        const sectionSchedule = section.schedule;
        
        return (
          <div key={section.title} className="card border-0 shadow-sm mb-3">
            <div 
              className={`card-header border-0 cursor-pointer ${hasData ? 'bg-cookie-yellow' : 'bg-light'}`}
              onClick={() => toggleSection(section.title)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <h6 className="mb-0 text-cookie-brown">
                    <i className="bi bi-list-ol me-2"></i>
                    {section.title}
                  </h6>
                  {sectionSchedule && (
                    <span className="badge bg-secondary text-white ms-2 px-2 py-1">
                      {sectionSchedule}
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center">
                  {section.title === 'Total Income' && (
                    <span className="badge bg-cookie-orange text-white me-2">
                      {formatCurrency(totals.totalIncome)}
                    </span>
                  )}
                  {hasData && (
                    <span className="badge bg-success text-white me-2">
                      <i className="bi bi-check-circle me-1"></i>
                      Complete
                    </span>
                  )}
                  <i className={`bi bi-chevron-${expandedSections.has(section.title) ? 'up' : 'down'} text-cookie-brown`}></i>
                </div>
              </div>
            </div>

          {expandedSections.has(section.title) && (
            <div className="card-body">
              <div className="row g-3">
                {section.lines.map((line, lineIndex) => (
                  <div key={`${section.title}-${line.number || lineIndex}`} className="col-md-6">
                    <div className="d-flex align-items-start">
                      {line.number && (
                        <div className="me-3">
                          <span className="badge bg-cookie-brown text-white rounded-pill px-3">
                            {line.number}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-grow-1">
                        <label className="form-label text-cookie-brown fw-semibold mb-1">
                          {line.description}
                          {line.help && (
                            <i 
                              className="bi bi-info-circle ms-2 text-cookie-orange"
                              title={line.help}
                            ></i>
                          )}
                        </label>
                        
                        {line.type === 'currency' && (
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                              type="number"
                              className="form-control"
                              value={(currentInputs as any)[line.field] || ''}
                              onChange={(e) => handleFieldChange(line.field, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              step="0.01"
                            />
                          </div>
                        )}
                        
                        {line.type === 'text' && (
                          <input
                            type="text"
                            className="form-control"
                            value={(currentInputs as any)[line.field] || ''}
                            onChange={(e) => handleFieldChange(line.field, e.target.value)}
                          />
                        )}
                        
                        {line.type === 'select' && line.options && (
                          <select
                            className="form-select"
                            value={(currentInputs as any)[line.field] || ''}
                            onChange={(e) => handleFieldChange(line.field, e.target.value)}
                          >
                            <option value="">Select...</option>
                            {line.options.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {line.type === 'checkbox' && (
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={!!(currentInputs as any)[line.field]}
                              onChange={(e) => handleFieldChange(line.field, e.target.checked)}
                            />
                            <label className="form-check-label">
                              Yes
                            </label>
                          </div>
                        )}
                        
                        {line.calculation && (
                          <small className="text-muted d-block mt-1">
                            <i className="bi bi-calculator me-1"></i>
                            {line.calculation}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        );
      })}

      {/* Summary */}
      <div className="card border-0 bg-cookie-cream">
        <div className="card-body">
          <h6 className="text-cookie-brown mb-3">
            <i className="bi bi-calculator me-2"></i>
            Quick Summary
          </h6>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="text-center">
                <div className="h4 text-cookie-brown">{formatCurrency(totals.totalIncome)}</div>
                <small className="text-muted">Total Income</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="h4 text-cookie-brown">{formatCurrency(totals.totalDeductions)}</div>
                <small className="text-muted">Total Deductions</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="h4 text-cookie-brown">{formatCurrency(totals.netIncome)}</div>
                <small className="text-muted">Net Income</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Required Schedules List */}
      {activeSchedules.length > 1 && (
        <div className="card border-0 bg-light">
          <div className="card-body">
            <h6 className="text-cookie-brown mb-3">
              <i className="bi bi-files me-2"></i>
              Forms & Schedules Required
            </h6>
            <div className="row">
              <div className="col-md-6">
                <ul className="list-unstyled mb-0">
                  {activeSchedules.slice(0, Math.ceil(activeSchedules.length / 2)).map(schedule => (
                    <li key={schedule} className="mb-2">
                      <i className="bi bi-file-earmark text-cookie-orange me-2"></i>
                      <span className="text-cookie-brown">{schedule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-unstyled mb-0">
                  {activeSchedules.slice(Math.ceil(activeSchedules.length / 2)).map(schedule => (
                    <li key={schedule} className="mb-2">
                      <i className="bi bi-file-earmark text-cookie-orange me-2"></i>
                      <span className="text-cookie-brown">{schedule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      <T1QuizModal 
        show={showQuiz}
        onClose={() => setShowQuiz(false)}
        onComplete={handleQuizComplete}
      />
    </div>
  );
} 