import { useScenarioStore, CalculatorType } from '@/stores/useScenarioStore';

const calculatorLabels: Record<CalculatorType, { label: string; icon: string; color: string }> = {
  indTax: { 
    label: '1. Individual Income Tax (QC + Fed)', 
    icon: 'bi-person-circle', 
    color: 'primary' 
  },
  corpTax: { 
    label: '2. Corporate Income Tax', 
    icon: 'bi-building', 
    color: 'success' 
  },
  corpCapGain: { 
    label: '3. Corporate Capital Gain', 
    icon: 'bi-graph-up', 
    color: 'info' 
  },
  deathTax: { 
    label: '4. Death Tax & Estate Planning', 
    icon: 'bi-hourglass-split', 
    color: 'warning' 
  },
  rollover85: { 
    label: '5. § 85 Rollover Wizard', 
    icon: 'bi-arrow-repeat', 
    color: 'secondary' 
  },
  departureTax: { 
    label: '6. Departure Tax', 
    icon: 'bi-airplane', 
    color: 'danger' 
  },
  amt: { 
    label: '7. AMT (post-2024 rules)', 
    icon: 'bi-calculator', 
    color: 'dark' 
  },
  windup88: { 
    label: '8. Wind-up (§ 88)', 
    icon: 'bi-archive', 
    color: 'info' 
  }
};

export default function CalculatorSelector() {
  const { activeCalculator, setActiveCalculator } = useScenarioStore();

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center mb-3">
        <i className="bi bi-list-ul me-2 text-tax-primary"></i>
        <h6 className="mb-0 text-tax-primary fw-semibold">Select Calculator</h6>
      </div>
      
      <div className="input-group">
        <span className="input-group-text bg-tax-primary text-white border-0">
          <i className={`${calculatorLabels[activeCalculator].icon} me-1`}></i>
        </span>
        <select 
          className="form-select border-0 shadow-sm"
          value={activeCalculator}
          onChange={(e) => setActiveCalculator(e.target.value as CalculatorType)}
        >
          {Object.entries(calculatorLabels).map(([key, info]) => (
            <option key={key} value={key}>
              {info.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mt-2">
        <div className="d-flex align-items-center justify-content-between">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Current: {calculatorLabels[activeCalculator].label.split('.')[1]?.trim() || calculatorLabels[activeCalculator].label}
          </small>
          <span className={`badge bg-${calculatorLabels[activeCalculator].color} badge-sm`}>
            <i className={`${calculatorLabels[activeCalculator].icon} me-1`}></i>
            Active
          </span>
        </div>
      </div>
    </div>
  );
} 