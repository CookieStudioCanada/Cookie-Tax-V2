import { useScenarioStore } from '@/stores/useScenarioStore';
import T1OutputDisplay from './T1OutputDisplay';
import T2OutputDisplay from './T2OutputDisplay';

const outputConfigs = {
  indTax: [
    { key: 'netTax', label: 'Net Tax Payable', format: 'currency' as const, icon: 'bi-cash-stack', color: 'danger', description: 'Total federal and Quebec tax' },
    { key: 'marginalRate', label: 'Marginal Tax Rate', format: 'percentage' as const, icon: 'bi-percent', color: 'warning', description: 'Rate on next dollar of income' },
    { key: 'effectiveRate', label: 'Effective Tax Rate', format: 'percentage' as const, icon: 'bi-calculator', color: 'info', description: 'Average rate on total income' }
  ],
  corpTax: [
    { key: 'federalTax', label: 'Federal Tax', format: 'currency' as const, icon: 'bi-building', color: 'primary', description: 'Federal corporate income tax' },
    { key: 'provincialTax', label: 'Provincial Tax', format: 'currency' as const, icon: 'bi-geo-alt', color: 'success', description: 'Provincial corporate income tax' },
    { key: 'grip', label: 'GRIP Addition', format: 'currency' as const, icon: 'bi-piggy-bank', color: 'info', description: 'General rate income pool addition' },
    { key: 'lrip', label: 'LRIP Addition', format: 'currency' as const, icon: 'bi-wallet', color: 'secondary', description: 'Low rate income pool addition' }
  ],
  corpCapGain: [
    { key: 'taxableCapitalGain', label: 'Taxable Capital Gain', format: 'currency' as const, icon: 'bi-graph-up', color: 'success', description: '50% of capital gain' },
    { key: 'cdaAddition', label: 'CDA Addition', format: 'currency' as const, icon: 'bi-plus-circle', color: 'info', description: 'Addition to capital dividend account' },
    { key: 'refundableTax', label: 'Refundable Tax', format: 'currency' as const, icon: 'bi-arrow-counterclockwise', color: 'warning', description: 'Part I refundable tax on investment income' }
  ],
  deathTax: [
    { key: 'deemedProceeds', label: 'Deemed Proceeds', format: 'currency' as const, icon: 'bi-hourglass-split', color: 'warning', description: 'Deemed proceeds on death' },
    { key: 'totalTax', label: 'Total Tax', format: 'currency' as const, icon: 'bi-cash-stack', color: 'danger', description: 'Total tax on deemed disposition' },
    { key: 'netEstateValue', label: 'Net Estate Value', format: 'currency' as const, icon: 'bi-piggy-bank', color: 'success', description: 'Estate value after tax' },
    { key: 'liquidityRequired', label: 'Liquidity Required', format: 'currency' as const, icon: 'bi-droplet', color: 'info', description: 'Cash needed for tax payment' }
  ],
  rollover85: [
    { key: 'minElectedAmount', label: 'Minimum Elected Amount', format: 'currency' as const, icon: 'bi-arrow-down', color: 'info', description: 'Lowest permissible elected amount' },
    { key: 'maxElectedAmount', label: 'Maximum Elected Amount', format: 'currency' as const, icon: 'bi-arrow-up', color: 'warning', description: 'Highest permissible elected amount' },
    { key: 'cdaBump', label: 'CDA Bump', format: 'currency' as const, icon: 'bi-plus-circle', color: 'success', description: 'Addition to capital dividend account' },
    { key: 'puc', label: 'PUC of Shares', format: 'currency' as const, icon: 'bi-cash-coin', color: 'primary', description: 'Paid-up capital of shares issued' },
    { key: 'grip', label: 'GRIP Addition', format: 'currency' as const, icon: 'bi-piggy-bank', color: 'secondary', description: 'General rate income pool addition' }
  ],
  departureTax: [
    { key: 'deemedCapitalGain', label: 'Deemed Capital Gain', format: 'currency' as const, icon: 'bi-airplane', color: 'danger', description: 'Capital gain on deemed disposition' },
    { key: 'foreignTaxCreditCarryover', label: 'FTC Carry-forward', format: 'currency' as const, icon: 'bi-arrow-right-circle', color: 'info', description: 'Foreign tax credit available for carry-forward' }
  ],
  amt: [
    { key: 'tentativeAMT', label: 'Tentative AMT', format: 'currency' as const, icon: 'bi-calculator', color: 'warning', description: 'Alternative minimum tax before credits' },
    { key: 'creditCarryForward', label: 'AMT Credit Carry-forward', format: 'currency' as const, icon: 'bi-arrow-right', color: 'info', description: 'AMT credit available for future years' }
  ],
  windup88: [
    { key: 'taxFreeDividendBuckets', label: 'Tax-free Distributions', format: 'currency' as const, icon: 'bi-gift', color: 'success', description: 'Maximum tax-free distributions available' },
    { key: 'integrationResult', label: 'Integration Result', format: 'currency' as const, icon: 'bi-check-circle', color: 'primary', description: 'Perfect integration calculation result' }
  ]
};

export default function DynamicOutputDisplay() {
  const { activeCalculator, outputs } = useScenarioStore();

  // Use specialized T1 display for individual tax calculator
  if (activeCalculator === 'indTax') {
    return <T1OutputDisplay />;
  }

  // Use specialized T2 display for corporate tax calculator
  if (activeCalculator === 'corpTax') {
    return <T2OutputDisplay />;
  }

  const formatValue = (value: number, format: 'currency' | 'percentage') => {
    if (isNaN(value) || value === null || value === undefined) return format === 'currency' ? '$0.00' : '0.00%';
    
    if (format === 'currency') {
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } else {
      return `${value.toFixed(2)}%`;
    }
  };

  const config = outputConfigs[activeCalculator];
  const currentOutput = outputs[activeCalculator];

  if (!currentOutput) {
    return (
      <div className="text-center py-4">
        <div className="mb-3">
          <i className="bi bi-hourglass-split display-4 text-cookie-orange"></i>
        </div>
        <h6 className="text-cookie-brown mb-2">🍪 Calculating Results...</h6>
        <p className="small text-cookie-brown mb-3">
          Enter input parameters to see calculation results
        </p>
        <div className="spinner-border text-cookie-orange" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {config.map(({ key, label, format, icon, color, description }, index) => {
        const value = (currentOutput as any)[key] || 0;
        const isPositive = value >= 0;
        
        return (
          <div key={key} className="mb-3">
            <div className="card border-0 bg-cookie-cream">
              <div className="card-body p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className={`rounded-circle bg-cookie-yellow p-2 me-3`}>
                      <i className={`${icon} text-cookie-brown`}></i>
                    </div>
                    <div>
                      <h6 className="card-title mb-1 text-cookie-brown">{label}</h6>
                      <small className="text-cookie-brown opacity-75">{description}</small>
                    </div>
                  </div>
                  
                  <div className="text-end">
                    <div className="h5 mb-1 text-cookie-brown fw-bold">
                      {formatValue(value, format)}
                    </div>
                    {format === 'currency' && (
                      <span className={`badge ${isPositive ? 'bg-cookie-orange' : 'bg-success'} text-white`}>
                        <i className={`bi bi-arrow-${isPositive ? 'up' : 'down'} me-1`}></i>
                        {isPositive ? 'Owing' : 'Refund'}
                      </span>
                    )}
                    {format === 'percentage' && (
                      <span className="badge bg-cookie-yellow text-cookie-brown">
                        Rate
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {config.length === 0 && (
        <div className="text-center py-4">
          <i className="bi bi-bar-chart display-4 text-cookie-orange"></i>
          <p className="text-cookie-brown mt-2">No output parameters for this calculator</p>
        </div>
      )}
      
      {/* Summary Footer */}
      {config.length > 0 && (
        <div className="mt-4 p-3 bg-cookie-yellow rounded-4 border border-cookie-brown">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <small className="text-cookie-brown">
                <i className="bi bi-clock me-1"></i>
                Last updated: {new Date().toLocaleTimeString()}
              </small>
            </div>
            <div>
              <span className="badge bg-success text-white">
                <i className="bi bi-check-circle me-1"></i>
                🍪 Complete
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 