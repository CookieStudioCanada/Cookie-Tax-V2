import React, { useState } from 'react';
import { useScenarioStore } from '@/stores/useScenarioStore';

interface CalculationStep {
  line: string;
  description: string;
  amount: number;
  calculation?: string;
  isSubtotal?: boolean;
  isTotal?: boolean;
  rate?: number;
}

interface TaxSection {
  title: string;
  steps: CalculationStep[];
  requiredForms?: string[];
  mandatory?: boolean;
}

export default function T2OutputDisplay() {
  const { inputs, outputs } = useScenarioStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Tax Calculation']));
  
  const currentInputs = inputs.corpTax || {};
  const currentOutput = outputs.corpTax;

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

  // Calculate detailed corporate tax breakdown
  const calculateDetailedBreakdown = (): TaxSection[] => {
    const activeBusinessIncome = currentInputs.abi || 0;
    const investmentIncome = currentInputs.refundableTaxes || 0;
    const taxableIncome = activeBusinessIncome + investmentIncome;
    
    // Basic federal tax (38%)
    const basicFederalTax = taxableIncome * 0.38;
    const federalAbatement = taxableIncome * 0.10;
    const netFederalTax = basicFederalTax - federalAbatement;
    
    // Small Business Deduction
    const sbdEligibleIncome = Math.min(500000, activeBusinessIncome);
    const sbdAmount = sbdEligibleIncome * 0.19;
    
    // General rate reduction
    const generalRateIncome = Math.max(0, activeBusinessIncome - sbdEligibleIncome) + investmentIncome;
    const generalRateReduction = generalRateIncome * 0.13;
    
    const federalTaxPayable = netFederalTax - sbdAmount - generalRateReduction;
    const totalTaxPayable = federalTaxPayable;

    return [
      {
        title: "Federal Tax Calculation",
        mandatory: true,
        steps: [
          { line: "501", description: "Basic federal tax (38%)", amount: basicFederalTax, rate: 38 },
          { line: "502", description: "Federal abatement (10%)", amount: federalAbatement, rate: 10 },
          { line: "503", description: "Net federal tax", amount: netFederalTax, isSubtotal: true },
          { line: "505", description: "Small business deduction", amount: sbdAmount, rate: 19 },
          { line: "504", description: "General rate reduction", amount: generalRateReduction, rate: 13 },
          { line: "520", description: "Federal tax payable", amount: federalTaxPayable, isTotal: true }
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
          <i className="bi bi-building display-4 text-cookie-orange"></i>
        </div>
        <h6 className="text-cookie-brown mb-2">🏢 Processing Corporate Tax...</h6>
        <div className="spinner-border text-cookie-orange" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="t2-output-display">
      <div className="card border-0 bg-cookie-cream mb-4">
        <div className="card-body">
          <h5 className="text-cookie-brown mb-3">
            <i className="bi bi-building-check me-2"></i>
            Corporate Tax Summary
          </h5>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="text-center p-3 bg-white rounded-3">
                <div className="h4 text-cookie-brown mb-1">{formatCurrency(currentOutput.federalTax || 0)}</div>
                <small className="text-muted">Federal Tax</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-white rounded-3">
                <div className="h4 text-cookie-brown mb-1">{formatCurrency(currentOutput.provincialTax || 0)}</div>
                <small className="text-muted">Provincial Tax</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-white rounded-3">
                <div className="h4 text-cookie-orange mb-1">{formatCurrency(currentOutput.grip || 0)}</div>
                <small className="text-muted">GRIP</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center p-3 bg-white rounded-3">
                <div className="h4 text-cookie-brown mb-1">{formatCurrency(currentOutput.lrip || 0)}</div>
                <small className="text-muted">LRIP</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="card border-0 shadow-sm mb-3">
          <div 
            className="card-header bg-cookie-orange text-white border-0 cursor-pointer"
            onClick={() => toggleSection(section.title)}
          >
            <h6 className="mb-0">
              <i className="bi bi-building me-2"></i>
              {section.title}
            </h6>
          </div>

          {expandedSections.has(section.title) && (
            <div className="card-body">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Description</th>
                    <th className="text-end">Amount</th>
                    <th className="text-center">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {section.steps.map((step, stepIndex) => (
                    <tr key={stepIndex} className={step.isTotal ? 'table-warning' : step.isSubtotal ? 'table-info' : ''}>
                      <td>
                        <span className="badge bg-cookie-brown text-white">
                          {step.line}
                        </span>
                      </td>
                      <td className={step.isTotal || step.isSubtotal ? 'fw-bold' : ''}>
                        {step.description}
                      </td>
                      <td className={`text-end ${step.isTotal || step.isSubtotal ? 'fw-bold' : ''}`}>
                        {formatCurrency(step.amount)}
                      </td>
                      <td className="text-center">
                        {step.rate && (
                          <span className="badge bg-cookie-yellow text-cookie-brown">
                            {step.rate}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 