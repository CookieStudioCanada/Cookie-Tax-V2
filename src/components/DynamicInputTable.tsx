import { useScenarioStore, CalculatorType } from '@/stores/useScenarioStore';
import T1GeneralForm from './T1GeneralForm';
import T2GeneralForm from './T2GeneralForm';
import CapitalGainsForm from './CapitalGainsForm';

const inputConfigs = {
  indTax: [
    { key: 'salary', label: 'Employment Income', type: 'number' as const, icon: 'bi-briefcase', description: 'T4 employment income' },
    { key: 'eligibleDiv', label: 'Eligible Dividends', type: 'number' as const, icon: 'bi-cash-coin', description: 'Eligible dividends received' },
    { key: 'otherIncome', label: 'Other Income', type: 'number' as const, icon: 'bi-plus-circle', description: 'Other sources of income' },
    { key: 'notes', label: 'Notes', type: 'text' as const, icon: 'bi-journal-text', description: 'Additional notes or assumptions' }
  ],
  corpTax: [
    { key: 'abi', label: 'Active Business Income', type: 'number' as const, icon: 'bi-building', description: 'Active business income eligible for SBD' },
    { key: 'sbdEligibility', label: 'SBD Eligibility %', type: 'number' as const, icon: 'bi-percent', description: 'Small business deduction eligibility percentage' },
    { key: 'refundableTaxes', label: 'Refundable Taxes', type: 'number' as const, icon: 'bi-arrow-counterclockwise', description: 'Part IV and Part I refundable taxes' },
    { key: 'rdtohBalance', label: 'RDTOH Balance', type: 'number' as const, icon: 'bi-piggy-bank', description: 'Refundable dividend tax on hand balance' }
  ],
  corpCapGain: [
    { key: 'proceeds', label: 'Proceeds of Disposition', type: 'number' as const, icon: 'bi-cash-stack', description: 'Gross proceeds from asset sale' },
    { key: 'acb', label: 'Adjusted Cost Base', type: 'number' as const, icon: 'bi-calculator', description: 'Tax cost of the asset' },
    { key: 'safeIncomeBump', label: 'Safe Income Bump', type: 'number' as const, icon: 'bi-shield-check', description: 'Available safe income per share' },
    { key: 'vDay', label: 'V-day Value', type: 'number' as const, icon: 'bi-calendar-date', description: 'Valuation Day (Dec 22, 1971) value' },
    { key: 'cdaBalance', label: 'CDA Balance', type: 'number' as const, icon: 'bi-wallet', description: 'Capital dividend account balance' }
  ],
  deathTax: [
    { key: 'dateOfDeath', label: 'Date of Death', type: 'text' as const, icon: 'bi-calendar-date', description: 'Date when deemed disposition occurs' },
    { key: 'fmvAtDeath', label: 'FMV at Death', type: 'number' as const, icon: 'bi-graph-up', description: 'Fair market value at time of death' },
    { key: 'acb', label: 'Adjusted Cost Base', type: 'number' as const, icon: 'bi-calculator', description: 'Tax cost of the property' },
    { key: 'propertyType', label: 'Property Type', type: 'text' as const, icon: 'bi-house', description: 'Type of property (capital, depreciable, etc.)' },
    { key: 'deferralToSpouse', label: 'Spousal Rollover', type: 'checkbox' as const, icon: 'bi-heart', description: 'Elect rollover to surviving spouse' }
  ],
  rollover85: [
    { key: 'selectedAssets', label: 'Selected Assets', type: 'number' as const, icon: 'bi-check-square', description: 'FMV of assets selected for rollover' },
    { key: 'electedAmount', label: 'Elected Amount', type: 'number' as const, icon: 'bi-hand-index', description: 'Amount elected on Form T2057' },
    { key: 'fmv', label: 'Fair Market Value', type: 'number' as const, icon: 'bi-graph-up', description: 'Fair market value of assets' },
    { key: 'acb', label: 'Adjusted Cost Base', type: 'number' as const, icon: 'bi-calculator', description: 'Tax cost of assets to transferor' },
    { key: 'boot', label: 'Boot', type: 'number' as const, icon: 'bi-box', description: 'Non-share consideration received' }
  ],
  departureTax: [
    { key: 'fmvAtEmigration', label: 'FMV at Emigration', type: 'number' as const, icon: 'bi-airplane-engines', description: 'Fair market value when ceasing residence' },
    { key: 'acb', label: 'Adjusted Cost Base', type: 'number' as const, icon: 'bi-calculator', description: 'Tax cost of the property' },
    { key: 'exemptPropertyFlag', label: 'Exempt Property', type: 'checkbox' as const, icon: 'bi-shield-check', description: 'Property exempt from departure tax' }
  ],
  amt: [
    { key: 'adjustedTaxableIncome', label: 'Adjusted Taxable Income', type: 'number' as const, icon: 'bi-calculator', description: 'Regular taxable income adjusted for AMT' },
    { key: 'preferenceItems', label: 'Preference Items', type: 'number' as const, icon: 'bi-star', description: 'AMT preference items and adjustments' },
    { key: 'capitalGainsPercentage', label: 'Capital Gains %', type: 'number' as const, icon: 'bi-percent', description: 'Percentage of capital gains included' }
  ],
  windup88: [
    { key: 'puc', label: 'Paid-up Capital', type: 'number' as const, icon: 'bi-cash-coin', description: 'PUC of shares being wound up' },
    { key: 'grip', label: 'GRIP Balance', type: 'number' as const, icon: 'bi-piggy-bank', description: 'General rate income pool balance' },
    { key: 'cda', label: 'CDA Balance', type: 'number' as const, icon: 'bi-wallet', description: 'Capital dividend account balance' },
    { key: 'nerdtoh', label: 'Non-eligible RDTOH', type: 'number' as const, icon: 'bi-arrow-counterclockwise', description: 'Non-eligible refundable dividend tax' },
    { key: 'rdtoh', label: 'Eligible RDTOH', type: 'number' as const, icon: 'bi-arrow-repeat', description: 'Eligible refundable dividend tax' }
  ]
};

export default function DynamicInputTable() {
  const { activeCalculator, inputs, setField } = useScenarioStore();

  // Use the enhanced T1 form for individual tax calculator
  if (activeCalculator === 'indTax') {
    return <T1GeneralForm />;
  }

  // Use the enhanced T2 form for corporate tax calculator
  if (activeCalculator === 'corpTax') {
    return <T2GeneralForm />;
  }

  // Use the enhanced Capital Gains form for corp capital gains calculator
  if (activeCalculator === 'corpCapGain') {
    return <CapitalGainsForm />;
  }

  const handleChange = (field: string, value: string | boolean) => {
    if (typeof value === 'boolean') {
      (setField as any)(activeCalculator, field, value);
    } else if (field === 'notes') {
      (setField as any)(activeCalculator, field, value);
    } else {
      const numValue = parseFloat(value) || 0;
      (setField as any)(activeCalculator, field, numValue);
    }
  };

  const config = inputConfigs[activeCalculator];
  const currentInputs = inputs[activeCalculator] || {};

  return (
    <div className="fade-in">
      {config.map(({ key, label, type, icon, description }, index) => (
        <div key={key} className="mb-3">
          <label className="form-label d-flex align-items-center">
            <i className={`${icon} me-2 text-cookie-orange`}></i>
            <span className="fw-semibold text-cookie-brown">{label}</span>
          </label>
          
          <div className="input-group">
            <span className="input-group-text">
              <i className={`${icon} text-cookie-brown`}></i>
            </span>
            
            {type === 'checkbox' ? (
              <div className="form-control d-flex align-items-center">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`${activeCalculator}-${key}`}
                    checked={!!(currentInputs as any)[key]}
                    onChange={(e) => handleChange(key, e.target.checked)}
                  />
                  <label className="form-check-label small text-cookie-brown ms-2" htmlFor={`${activeCalculator}-${key}`}>
                    {(currentInputs as any)[key] ? 'Yes' : 'No'}
                  </label>
                </div>
              </div>
            ) : type === 'number' ? (
              <input
                type="number"
                className="form-control"
                value={(currentInputs as any)[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            ) : (
              <input
                type="text"
                className="form-control"
                value={(currentInputs as any)[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            )}
            
            {type === 'number' && (
              <span className="input-group-text">
                <small className="text-cookie-brown fw-semibold">CAD</small>
              </span>
            )}
          </div>
          
          <div className="form-text">
            <i className="bi bi-info-circle me-1 text-cookie-orange"></i>
            <span className="text-cookie-brown">{description}</span>
          </div>
        </div>
      ))}
      
      {config.length === 0 && (
        <div className="text-center py-4">
          <i className="bi bi-inbox display-4 text-muted"></i>
          <p className="text-muted mt-2">No input parameters for this calculator</p>
        </div>
      )}
    </div>
  );
} 