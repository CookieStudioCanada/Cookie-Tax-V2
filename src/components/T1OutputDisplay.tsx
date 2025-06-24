import React, { useState } from 'react';
import { useScenarioStore } from '@/stores/useScenarioStore';

interface CalculationStep {
  line: string;
  description: string;
  amount: number;
  calculation?: string;
  isSubtotal?: boolean;
  isTotal?: boolean;
}

interface TaxSection {
  title: string;
  steps: CalculationStep[];
  requiredForms?: string[];
  mandatory?: boolean;
}

export default function T1OutputDisplay() {
  const { inputs, outputs } = useScenarioStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Tax Calculation']));
  
  const currentInputs = inputs.indTax || {};
  const currentOutput = outputs.indTax;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Calculate detailed breakdown
  const calculateDetailedBreakdown = (): TaxSection[] => {
    const salary = currentInputs.salary || 0;
    const eligibleDiv = currentInputs.eligibleDiv || 0;
    const nonEligibleDiv = currentInputs.nonEligibleDiv || 0;
    const otherIncome = currentInputs.otherIncome || 0;
    const capitalGains = currentInputs.capitalGains || 0;
    const businessIncome = currentInputs.businessIncome || 0;
    const rentalIncome = currentInputs.rentalIncome || 0;
    const pensionIncome = currentInputs.pensionIncome || 0;
    
    // Gross-up eligible dividends (38% gross-up)
    const eligibleDivGrossUp = eligibleDiv * 0.38;
    const grossedUpEligibleDiv = eligibleDiv + eligibleDivGrossUp;
    
    // Non-eligible dividends (15% gross-up)
    const nonEligibleDivGrossUp = nonEligibleDiv * 0.15;
    const grossedUpNonEligibleDiv = nonEligibleDiv + nonEligibleDivGrossUp;
    
    const totalIncome = salary + grossedUpEligibleDiv + grossedUpNonEligibleDiv + 
                       otherIncome + capitalGains + businessIncome + rentalIncome + pensionIncome;
    
    // Deductions
    const rrspContribution = currentInputs.rrspContribution || 0;
    const unionDues = currentInputs.unionDues || 0;
    const childCareExpenses = currentInputs.childCareExpenses || 0;
    const movingExpenses = currentInputs.movingExpenses || 0;
    const supportPayments = currentInputs.supportPayments || 0;
    const carryingCharges = currentInputs.carryingCharges || 0;
    
    const totalDeductions = rrspContribution + unionDues + childCareExpenses + 
                           movingExpenses + supportPayments + carryingCharges;
    
    const netIncome = totalIncome - totalDeductions;
    const taxableIncome = netIncome; // Simplified
    
    // Federal tax calculation (2024 rates) - bracket by bracket
    let federalTax = 0;
    const federalBrackets = [];
    
    // Bracket 1: 15% on first $55,867
    const bracket1 = Math.min(taxableIncome, 55867);
    const bracket1Tax = bracket1 * 0.15;
    federalTax += bracket1Tax;
    if (bracket1 > 0) {
      federalBrackets.push({
        range: `$0 - $${bracket1.toLocaleString()}`,
        rate: '15%',
        tax: bracket1Tax,
        description: 'First bracket'
      });
    }
    
    // Bracket 2: 20.5% on $55,867 to $111,733
    if (taxableIncome > 55867) {
      const bracket2 = Math.min(taxableIncome - 55867, 111733 - 55867);
      const bracket2Tax = bracket2 * 0.205;
      federalTax += bracket2Tax;
      federalBrackets.push({
        range: `$55,867 - $${Math.min(taxableIncome, 111733).toLocaleString()}`,
        rate: '20.5%',
        tax: bracket2Tax,
        description: 'Second bracket'
      });
    }
    
    // Bracket 3: 26% on $111,733 to $173,205
    if (taxableIncome > 111733) {
      const bracket3 = Math.min(taxableIncome - 111733, 173205 - 111733);
      const bracket3Tax = bracket3 * 0.26;
      federalTax += bracket3Tax;
      federalBrackets.push({
        range: `$111,733 - $${Math.min(taxableIncome, 173205).toLocaleString()}`,
        rate: '26%',
        tax: bracket3Tax,
        description: 'Third bracket'
      });
    }
    
    // Bracket 4: 29% on $173,205 to $246,752
    if (taxableIncome > 173205) {
      const bracket4 = Math.min(taxableIncome - 173205, 246752 - 173205);
      const bracket4Tax = bracket4 * 0.29;
      federalTax += bracket4Tax;
      federalBrackets.push({
        range: `$173,205 - $${Math.min(taxableIncome, 246752).toLocaleString()}`,
        rate: '29%',
        tax: bracket4Tax,
        description: 'Fourth bracket'
      });
    }
    
    // Bracket 5: 33% on income over $246,752
    if (taxableIncome > 246752) {
      const bracket5 = taxableIncome - 246752;
      const bracket5Tax = bracket5 * 0.33;
      federalTax += bracket5Tax;
      federalBrackets.push({
        range: `$246,752 - $${taxableIncome.toLocaleString()}`,
        rate: '33%',
        tax: bracket5Tax,
        description: 'Top bracket'
      });
    }
    
    // Quebec tax calculation (2024 rates)
    let quebecTax = 0;
    if (currentInputs.province === 'QC') {
      if (taxableIncome > 126000) {
        quebecTax = 51780 * 0.14 + (103545 - 51780) * 0.19 + (126000 - 103545) * 0.24 + 
                   (taxableIncome - 126000) * 0.2575;
      } else if (taxableIncome > 103545) {
        quebecTax = 51780 * 0.14 + (103545 - 51780) * 0.19 + (taxableIncome - 103545) * 0.24;
      } else if (taxableIncome > 51780) {
        quebecTax = 51780 * 0.14 + (taxableIncome - 51780) * 0.19;
      } else {
        quebecTax = taxableIncome * 0.14;
      }
    }
    
    // Tax credits
    const basicPersonalAmount = 15705; // Federal BPA 2024
    const basicPersonalCredit = basicPersonalAmount * 0.15;
    
    const eligibleDivCredit = eligibleDivGrossUp; // 38% credit
    const nonEligibleDivCredit = nonEligibleDivGrossUp * (2/3); // 2/3 of gross-up
    
    const totalCredits = basicPersonalCredit + eligibleDivCredit + nonEligibleDivCredit;
    
    const netFederalTax = Math.max(0, federalTax - totalCredits);
    const totalTax = netFederalTax + quebecTax;
    
    return [
      {
        title: "Total Income Calculation",
        mandatory: true,
        requiredForms: salary > 0 ? ['T4'] : [],
        steps: [
          { line: "10100", description: "Employment income", amount: salary },
          { line: "12000", description: "Eligible dividends (grossed up)", amount: grossedUpEligibleDiv, 
            calculation: `$${eligibleDiv.toLocaleString()} + 38% gross-up ($${eligibleDivGrossUp.toLocaleString()})` },
          { line: "12010", description: "Non-eligible dividends (grossed up)", amount: grossedUpNonEligibleDiv,
            calculation: `$${nonEligibleDiv.toLocaleString()} + 15% gross-up ($${nonEligibleDivGrossUp.toLocaleString()})` },
          { line: "12100", description: "Interest and investment income", amount: otherIncome },
          { line: "12600", description: "Taxable capital gains (50%)", amount: capitalGains },
          { line: "12900", description: "Business income", amount: businessIncome },
          { line: "12500", description: "Rental income", amount: rentalIncome },
          { line: "11500", description: "Pension income", amount: pensionIncome },
          { line: "15000", description: "Total Income", amount: totalIncome, isTotal: true }
        ]
      },
      {
        title: "Deductions from Income",
        mandatory: rrspContribution > 0 || unionDues > 0 || childCareExpenses > 0,
        requiredForms: rrspContribution > 0 ? ['Schedule 7'] : [],
        steps: [
          { line: "20700", description: "RRSP contributions", amount: rrspContribution },
          { line: "21200", description: "Union and professional dues", amount: unionDues },
          { line: "21300", description: "Child care expenses", amount: childCareExpenses },
          { line: "21600", description: "Moving expenses", amount: movingExpenses },
          { line: "21700", description: "Support payments", amount: supportPayments },
          { line: "21900", description: "Carrying charges", amount: carryingCharges },
          { line: "23200", description: "Total Deductions", amount: totalDeductions, isSubtotal: true },
          { line: "23600", description: "Net Income", amount: netIncome, isTotal: true, 
            calculation: `Line 15000 ($${totalIncome.toLocaleString()}) - Line 23200 ($${totalDeductions.toLocaleString()})` }
        ]
      },
      {
        title: "Federal Tax Calculation",
        mandatory: true,
        steps: [
          ...federalBrackets.map((bracket, index) => ({
            line: `B${index + 1}`,
            description: `${bracket.description} (${bracket.rate})`,
            amount: bracket.tax,
            calculation: bracket.range
          })),
          { line: "Total", description: "Total Federal Tax", amount: federalTax, isSubtotal: true,
            calculation: "Sum of all brackets" },
          { line: "BPA", description: "Basic personal amount credit", amount: basicPersonalCredit,
            calculation: `$${basicPersonalAmount.toLocaleString()} × 15%` },
          { line: "DTC", description: "Dividend tax credits", amount: eligibleDivCredit + nonEligibleDivCredit,
            calculation: `Eligible: $${eligibleDivCredit.toLocaleString()} + Non-eligible: $${nonEligibleDivCredit.toLocaleString()}` },
          { line: "Fed", description: "Net Federal Tax", amount: netFederalTax, isTotal: true }
        ]
      },
      {
        title: "Provincial Tax (Quebec)",
        mandatory: currentInputs.province === 'QC',
        requiredForms: currentInputs.province === 'QC' ? ['TP-1'] : [],
        steps: [
          { line: "QC", description: "Quebec provincial tax", amount: quebecTax,
            calculation: "Progressive rates: 14%, 19%, 24%, 25.75%" }
        ]
      },
      {
        title: "Final Tax Calculation",
        mandatory: true,
        steps: [
          { line: "Total", description: "Total Tax Payable", amount: totalTax, isTotal: true,
            calculation: `Federal ($${netFederalTax.toLocaleString()}) + Quebec ($${quebecTax.toLocaleString()})` },
          { line: "Rate", description: "Effective Tax Rate", amount: totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0,
            calculation: `$${totalTax.toLocaleString()} ÷ $${totalIncome.toLocaleString()} × 100` },
          { line: "Marginal", description: "Marginal Tax Rate", amount: taxableIncome > 246752 ? 58.75 : 
            taxableIncome > 173205 ? 54.75 : taxableIncome > 126000 ? 50.75 : 44.75,
            calculation: "Federal + Quebec marginal rates" }
        ]
      }
    ];
  };

  const sections = calculateDetailedBreakdown();

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  if (!currentOutput) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <i className="bi bi-calculator display-4 text-cookie-orange"></i>
        </div>
        <h6 className="text-cookie-brown mb-2">🍪 Processing Tax Calculation...</h6>
        <p className="small text-cookie-brown mb-3">
          Complete the T1 form to see detailed results
        </p>
        <div className="spinner-border text-cookie-orange" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="t1-output-display">
      {/* Summary Card */}
      <div className="card border-0 bg-cookie-cream mb-4">
        <div className="card-body">
          <h5 className="text-cookie-brown mb-3">
            <i className="bi bi-receipt me-2"></i>
            Tax Calculation Summary
          </h5>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="text-center p-3 bg-white rounded-3 border border-cookie-yellow">
                <div className="h4 text-cookie-brown mb-1">{formatCurrency(currentOutput.netTax || 0)}</div>
                <small className="text-muted">Total Tax Payable</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-3 bg-white rounded-3 border border-cookie-yellow">
                <div className="h4 text-cookie-orange mb-1">{formatPercentage(currentOutput.marginalRate || 0)}</div>
                <small className="text-muted">Marginal Rate</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center p-3 bg-white rounded-3 border border-cookie-yellow">
                <div className="h4 text-cookie-brown mb-1">{formatPercentage(currentOutput.effectiveRate || 0)}</div>
                <small className="text-muted">Effective Rate</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      {sections.map((section, index) => (
        <div key={section.title} className="card border-0 shadow-sm mb-3">
          <div 
            className="card-header border-0 cursor-pointer bg-cookie-yellow"
            onClick={() => toggleSection(section.title)}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <h6 className="mb-0 text-cookie-brown">
                  <i className="bi bi-calculator me-2"></i>
                  {section.title}
                </h6>
                {section.requiredForms && section.requiredForms.length > 0 && (
                  <div className="ms-3">
                    {section.requiredForms.map(form => (
                      <span key={form} className="badge bg-secondary text-white me-1 px-2 py-1">
                        {form}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="d-flex align-items-center">
                <i className={`bi bi-chevron-${expandedSections.has(section.title) ? 'up' : 'down'} text-cookie-brown`}></i>
              </div>
            </div>
          </div>

          {expandedSections.has(section.title) && (
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th className="text-cookie-brown">Line</th>
                      <th className="text-cookie-brown">Description</th>
                      <th className="text-cookie-brown text-end">Amount</th>
                      <th className="text-cookie-brown">Calculation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.steps.map((step, stepIndex) => (
                      <tr key={stepIndex} className={step.isTotal ? 'table-warning' : step.isSubtotal ? 'table-info' : ''}>
                        <td>
                          <span className="badge bg-cookie-brown text-white rounded-pill px-3">
                            {step.line}
                          </span>
                        </td>
                        <td className={`${step.isTotal || step.isSubtotal ? 'fw-bold' : ''} text-cookie-brown`}>
                          {step.description}
                        </td>
                        <td className={`text-end ${step.isTotal || step.isSubtotal ? 'fw-bold' : ''} text-cookie-brown`}>
                          {step.line === 'Rate' || step.line === 'Marginal' ? 
                            formatPercentage(step.amount) : 
                            formatCurrency(step.amount)
                          }
                        </td>
                        <td className="small text-muted">
                          {step.calculation || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Tax Planning Tips */}
      <div className="card border-0 bg-cookie-yellow">
        <div className="card-body">
          <h6 className="text-cookie-brown mb-3">
            <i className="bi bi-lightbulb me-2"></i>
            Tax Planning Opportunities
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="alert alert-cookie-info mb-0">
                <h6 className="alert-heading">💰 RRSP Optimization</h6>
                <p className="mb-0 small">
                  Consider maximizing RRSP contributions to reduce taxable income and defer taxes.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="alert alert-cookie-info mb-0">
                <h6 className="alert-heading">📊 Income Splitting</h6>
                <p className="mb-0 small">
                  Explore pension splitting and spousal loans for tax-efficient income distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 