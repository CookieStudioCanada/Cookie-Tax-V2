import { useEffect, useState } from 'react';
import CalculatorSummary from './CalculatorSummary';
import DynamicInputTable from './DynamicInputTable';
import DynamicOutputDisplay from './DynamicOutputDisplay';
import { useScenarioStore, CalculatorType } from '@/stores/useScenarioStore';

type ViewType = 'home' | 'calculator';

function App() {
  const { activeCalculator, setActiveCalculator, recalc } = useScenarioStore();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Initial calculation on app load
  useEffect(() => {
    recalc();
  }, [recalc]);

  const calculatorNames: Record<CalculatorType, string> = {
    indTax: 'Individual Tax',
    corpTax: 'Corporate Tax',
    corpCapGain: 'Corporate Capital Gain',
    deathTax: 'Death Tax & Estate Planning',
    rollover85: 'Section 85 Rollover',
    departureTax: 'Departure Tax',
    amt: 'Alternative Minimum Tax',
    windup88: 'Section 88 Wind-up'
  };

  const handleCalculatorSelect = (calculatorType: CalculatorType) => {
    setActiveCalculator(calculatorType);
    setCurrentView('calculator');
    setShowMobileMenu(false);
  };

  const handleHomeClick = () => {
    setCurrentView('home');
    setShowMobileMenu(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg bg-cookie-cream border-bottom">
        <div className="container">
          <button 
            className="navbar-brand btn btn-link text-decoration-none p-0"
            onClick={handleHomeClick}
          >
            🍪 Cookie Tax 2.0
          </button>

          {/* Desktop & Mobile Dropdown Menu */}
          <div className="dropdown">
            <button
              className="btn btn-cookie-brown dropdown-toggle d-flex align-items-center"
              type="button"
              onClick={toggleMobileMenu}
              aria-expanded={showMobileMenu}
              data-bs-toggle="dropdown"
            >
              <i className="bi bi-list me-2"></i>
              {currentView === 'calculator' ? calculatorNames[activeCalculator] : 'Calculators'}
            </button>
            
            <ul className={`dropdown-menu dropdown-menu-end ${showMobileMenu ? 'show' : ''}`}>
              <li>
                <button 
                  className={`dropdown-item ${currentView === 'home' ? 'active' : ''}`}
                  onClick={handleHomeClick}
                >
                  <i className="bi bi-house me-2"></i>Home
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              {Object.entries(calculatorNames).map(([key, name]) => (
                <li key={key}>
                  <button 
                    className={`dropdown-item ${currentView === 'calculator' && activeCalculator === key ? 'active' : ''}`}
                    onClick={() => handleCalculatorSelect(key as CalculatorType)}
                  >
                    <i className="bi bi-calculator me-2"></i>{name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid p-4">
        {currentView === 'home' ? (
          // Home View - Calculator Cards
          <div>
            <div className="text-center mb-5">
              <h1 className="display-4 text-cookie-brown mb-3">🍪 Cookie Tax 2.0</h1>
              <p className="lead text-cookie-brown">
                Professional-grade Canadian tax calculators for Quebec and Federal taxation
              </p>
            </div>
            <CalculatorSummary onCalculatorSelect={handleCalculatorSelect} />
          </div>
        ) : (
          // Calculator View - Input/Output
          <div>
            {/* Calculator Header */}
            <div className="d-flex align-items-center mb-4">
              <button 
                className="btn btn-outline-cookie-brown me-3"
                onClick={handleHomeClick}
              >
                <i className="bi bi-arrow-left me-2"></i>Back to Home
              </button>
              <h2 className="text-cookie-brown mb-0">
                <i className="bi bi-calculator me-2"></i>
                {calculatorNames[activeCalculator]}
              </h2>
            </div>

            {/* Input/Output Section */}
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="card tax-card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-pencil-square me-2"></i>
                      Input Parameters
                    </h5>
                  </div>
                  <div className="card-body">
                    <DynamicInputTable />
                  </div>
                </div>
              </div>
              
              <div className="col-lg-6">
                <div className="card tax-card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-bar-chart-line me-2"></i>
                      Calculation Results
                    </h5>
                  </div>
                  <div className="card-body">
                    <DynamicOutputDisplay />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer className="bg-cookie-brown text-white py-3 mt-4">
        <div className="container text-center">
          <small>
            <i className="bi bi-exclamation-triangle me-2"></i>
            For educational purposes only. Consult a tax professional for actual tax planning.
          </small>
        </div>
      </footer>
    </>
  );
}

export default App; 