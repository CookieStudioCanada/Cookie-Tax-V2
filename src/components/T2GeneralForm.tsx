import React, { useState } from 'react';
import { useScenarioStore } from '@/stores/useScenarioStore';

interface T2Line {
  number: string;
  description: string;
  field: string;
  type: 'currency' | 'text' | 'checkbox' | 'select' | 'percentage' | 'number';
  options?: { value: string; label: string }[];
  help?: string;
  calculation?: string;
  schedule?: string;
}

interface T2Section {
  title: string;
  lines: T2Line[];
  schedule?: string;
  mandatory?: boolean;
}

const t2Sections: T2Section[] = [
  {
    title: "Corporation Information",
    mandatory: true,
    lines: [
      { number: "", description: "Corporation Name", field: "corporationName", type: "text" },
      { number: "", description: "Business Number", field: "businessNumber", type: "text" },
      { number: "", description: "Tax Year End", field: "taxYearEnd", type: "text" },
      { number: "", description: "Province of Incorporation", field: "province", type: "select",
        options: [
          { value: "QC", label: "Quebec" },
          { value: "ON", label: "Ontario" },
          { value: "BC", label: "British Columbia" },
          { value: "AB", label: "Alberta" }
        ]
      },
      { number: "", description: "CCPC Status", field: "ccpcStatus", type: "checkbox", 
        help: "Canadian-controlled private corporation" }
    ]
  },
  {
    title: "Income Statement Information",
    mandatory: true,
    lines: [
      { number: "100", description: "Sales, commissions and fees", field: "sales", type: "currency" },
      { number: "101", description: "Interest", field: "interestIncome", type: "currency" },
      { number: "102", description: "Dividends", field: "dividendsReceived", type: "currency" },
      { number: "106", description: "Net income for income tax purposes", field: "netIncomeForTax", type: "currency" }
    ]
  },
  {
    title: "Taxable Income",
    mandatory: true,
    lines: [
      { number: "400", description: "Net income for tax purposes", field: "netIncomeForTaxPurposes", type: "currency" },
      { number: "410", description: "Dividends deductible", field: "dividendsDeductible", type: "currency" },
      { number: "470", description: "Taxable income", field: "taxableIncome", type: "currency" }
    ]
  }
];

export default function T2GeneralForm() {
  const { inputs, setField } = useScenarioStore();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Corporation Information']));

  const currentInputs = inputs.corpTax || {};

  const handleFieldChange = (field: string, value: string | number | boolean) => {
    setField('corpTax', field as any, value);
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

  return (
    <div className="t2-general-form">
      <div className="card border-0 bg-cookie-cream mb-4">
        <div className="card-body">
          <h4 className="text-cookie-brown mb-2">
            <i className="bi bi-building me-2"></i>
            T2 Corporation Income Tax Return
          </h4>
        </div>
      </div>

      {t2Sections.map((section) => (
        <div key={section.title} className="card border-0 shadow-sm mb-3">
          <div 
            className="card-header bg-cookie-yellow border-0 cursor-pointer"
            onClick={() => toggleSection(section.title)}
          >
            <h6 className="text-cookie-brown mb-0">
              <i className="bi bi-building me-2"></i>
              {section.title}
            </h6>
          </div>

          {expandedSections.has(section.title) && (
            <div className="card-body">
              <div className="row g-3">
                {section.lines.map((line, lineIndex) => (
                  <div key={lineIndex} className="col-md-6">
                    <label className="form-label text-cookie-brown fw-semibold">
                      {line.number && <span className="badge bg-cookie-brown text-white me-2">{line.number}</span>}
                      {line.description}
                    </label>
                    
                    {line.type === 'currency' && (
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          value={(currentInputs as any)[line.field] || ''}
                          onChange={(e) => handleFieldChange(line.field, parseFloat(e.target.value) || 0)}
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
                        <label className="form-check-label">Yes</label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 