# Cookie Tax 2.0 (Nano MVP)

A purely client-side Québec/Canada tax playground built with modern web technologies.

## Tech Stack

- **Vite + React 18 + TypeScript** - Fast dev server with type safety
- **CSS Modules** - Scoped styling with zero runtime
- **Zustand** - Lightweight global state management
- **Plain HTML Tables** - Simple, accessible data display
- **Vitest + React Testing Library** - Lightweight unit testing
- **localStorage** - Client-side persistence

## Features

- ✅ Real-time tax calculation for Federal and Quebec taxes
- ✅ Editable income table with salary, dividends, and other income
- ✅ Automatic calculation on input changes
- ✅ Data persistence in localStorage
- ✅ Responsive design with clean UI
- ✅ Comprehensive unit tests

## Project Structure

```
src/
  components/
    App.tsx              # Main application component
    IncomeTable.tsx      # Editable income input table
    SummaryBar.tsx       # Tax calculation display
  stores/
    useScenarioStore.ts  # Zustand state management
  calculators/
    indTax.ts           # Pure tax calculation logic
  rates/
    2025.json           # Federal and Quebec tax brackets
  styles/
    table.module.css    # Table styling
    summary.module.css  # Summary bar styling
  tests/
    indTax.test.ts      # Unit tests for tax calculations
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Testing

```bash
npm test      # Run tests
npm run build # Production build
```

## How It Works

1. **Input Income**: Enter your salary, eligible dividends, and other income
2. **Real-time Calculation**: Tax is calculated automatically using 2025 tax brackets
3. **View Results**: See your combined Federal and Quebec tax burden
4. **Data Persistence**: Your inputs are saved to localStorage

## Tax Calculation

The calculator uses simplified 2025 tax brackets:

**Federal Tax Brackets:**
- 15% on income up to $55,867
- 20.5% on income from $55,867 to $111,733
- 26% on income from $111,733 to $173,205
- 29% on income from $173,205 to $246,752
- 33% on income over $246,752

**Quebec Tax Brackets:**
- 14% on income up to $51,780
- 19% on income from $51,780 to $103,545
- 24% on income from $103,545 to $126,000
- 25.75% on income over $126,000

## Limitations

- **Simplified Calculation**: This is a demo calculator and does not include:
  - Basic personal amounts and tax credits
  - Dividend gross-up and tax credits
  - Employment insurance and pension contributions
  - Deductions and other tax planning strategies
  
- **For Demonstration Only**: Do not use for actual tax planning. Consult a tax professional for real tax calculations.

## Architecture Decisions

- **Pure Functions**: Tax calculation logic is separated from UI components
- **Type Safety**: Full TypeScript coverage with strict compiler options
- **CSS Modules**: Scoped styling prevents class name conflicts
- **Zustand**: Minimal boilerplate for state management
- **localStorage**: Simple persistence without external dependencies
- **Plain Tables**: Accessible, semantic HTML without complex grid libraries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 