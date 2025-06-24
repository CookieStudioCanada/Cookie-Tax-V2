import { useState } from 'react';
import { useScenarioStore } from '@/stores/useScenarioStore';

interface CapitalGainsLine {
  number: string;
  description: string;
  field: string;
  type: 'currency' | 'text' | 'number' | 'date';
  calculation?: string;
}
 
const capitalGainsLines: CapitalGainsLine[] = [
  { number: "1", description: "Proceeds of disposition", field: "proceeds", type: "currency" },
  { number: "2", description: "Adjusted cost base", field: "acb", type: "currency" },
  { number: "3", description: "Outlays and expenses", field: "outlaysExpenses", type: "currency" },
  { number: "4", description: "Total ACB and expenses", field: "totalACBExpenses", type: "currency", 
    calculation: "Line 2 + Line 3" },
  { number: "5", description: "Capital gain (loss)", field: "capitalGainLoss", type: "currency",
    calculation: "Line 1 - Line 4" },
  { number: "6", description: "Reserve for this year", field: "reserve", type: "currency" },
  { number: "7", description: "Capital gain (loss) after reserve", field: "capitalGainAfterReserve", type: "currency",
    calculation: "Line 5 - Line 6" },
  { number: "8", description: "Taxable capital gain (50%)", field: "taxableCapitalGain", type: "currency",
    calculation: "Line 7 × 50%" }
];

export default function CapitalGainsForm() {
  const { inputs, setField } = useScenarioStore();
  const [calculatedValues, setCalculatedValues] = useState<Record<string, number>>({});

  const currentInputs = inputs.corpCapGain || {};

  const handleFieldChange = (field: string, value: number) => {
    setField('corpCapGain', field as any, value);
    calculateDependentFields(field, value);
  };

  const calculateDependentFields = (changedField: string, value: number) => {
    const newCalculated = { ...calculatedValues };
    const allInputs = { ...currentInputs, [changedField]: value };

    // Calculate total ACB and expenses
    const acb = allInputs.acb || 0;
    const outlaysExpenses = allInputs.outlaysExpenses || 0;
    newCalculated.totalACBExpenses = acb + outlaysExpenses;

    // Calculate capital gain/loss
    const proceeds = allInputs.proceeds || 0;
    newCalculated.capitalGainLoss = proceeds - newCalculated.totalACBExpenses;

    // Calculate capital gain after reserve
    const reserve = allInputs.reserve || 0;
    newCalculated.capitalGainAfterReserve = newCalculated.capitalGainLoss - reserve;

    // Calculate taxable capital gain (50%)
    newCalculated.taxableCapitalGain = Math.max(0, newCalculated.capitalGainAfterReserve * 0.5);

    setCalculatedValues(newCalculated);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getFieldValue = (field: string) => {
    return calculatedValues[field] || (currentInputs as any)[field] || 0;
  };

  return (
    <div className="capital-gains-form">
      <div className="card border-0 bg-cookie-cream mb-4">
        <div className="card-body">
          <h4 className="text-cookie-brown mb-2">
            <i className="bi bi-graph-up me-2"></i>
            Schedule 3 - Capital Gains and Losses
          </h4>
          <p className="text-cookie-brown opacity-75 mb-0">
            🇨🇦 Detailed calculation of capital gains for tax purposes
          </p>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-cookie-yellow border-0">
          <h6 className="text-cookie-brown mb-0">
            <i className="bi bi-calculator me-2"></i>
            Capital Gains Calculation
          </h6>
        </div>
        
        <div className="card-body">
          <div className="row g-3">
            {capitalGainsLines.map((line) => (
              <div key={line.field} className="col-md-6">
                <div className="d-flex align-items-start">
                  <div className="me-3">
                    <span className="badge bg-cookie-brown text-white rounded-pill px-3">
                      {line.number}
                    </span>
                  </div>
                  
                  <div className="flex-grow-1">
                    <label className="form-label text-cookie-brown fw-semibold mb-1">
                      {line.description}
                    </label>
                    
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        value={getFieldValue(line.field) || ''}
                        onChange={(e) => handleFieldChange(line.field, parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        step="0.01"
                        disabled={!!calculatedValues[line.field]}
                      />
                    </div>
                    
                    {line.calculation && (
                      <small className="text-muted d-block mt-1">
                        <i className="bi bi-calculator me-1"></i>
                        {line.calculation}
                      </small>
                    )}

                    {calculatedValues[line.field] && (
                      <div className="mt-1">
                        <span className="badge bg-info text-white">
                          <i className="bi bi-calculator me-1"></i>
                          Auto-calculated: {formatCurrency(calculatedValues[line.field])}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-cookie-yellow rounded-3">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="text-center">
                  <div className="h5 text-cookie-brown">
                    {formatCurrency(calculatedValues.capitalGainLoss || 0)}
                  </div>
                  <small className="text-muted">Capital Gain/Loss</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div className="h5 text-cookie-brown">
                    {formatCurrency(calculatedValues.taxableCapitalGain || 0)}
                  </div>
                  <small className="text-muted">Taxable Capital Gain</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div className="h5 text-cookie-orange">
                    50%
                  </div>
                  <small className="text-muted">Inclusion Rate</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 