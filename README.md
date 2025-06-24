# 🍪 Cookie Tax 2.0

Professional-grade Canadian tax calculators for Quebec and Federal taxation, now built with vanilla HTML, CSS (Bootstrap), and JavaScript.

## Features

- **8 Professional Tax Calculators:**
  - Individual Tax Calculator (T1)
  - Corporate Tax Calculator (T2)
  - Corporate Capital Gains
  - Death Tax & Estate Planning
  - Section 85 Rollover
  - Departure Tax (Emigration)
  - Alternative Minimum Tax (AMT)
  - Section 88 Wind-up

- **Key Benefits:**
  - Clean vanilla JavaScript - no React complexity
  - Bootstrap 5 for responsive design
  - Separate calculator modules for easy maintenance
  - Canadian federal and Quebec tax rates (2025)
  - Real-time calculations
  - Professional tax planning insights

## Quick Start

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. No build process, dependencies, or server required!

## Structure

```
Cookie Tax V2/
├── index.html              # Main application
├── css/
│   └── styles.css          # Custom styling with cookie theme
├── js/
│   ├── app.js              # Main application logic
│   └── calculators/        # Individual calculator modules
│       ├── indTax.js       # Individual tax calculator
│       ├── corpTax.js      # Corporate tax calculator
│       ├── corpCapGain.js  # Corporate capital gains
│       ├── deathTax.js     # Death tax calculator
│       ├── rollover85.js   # Section 85 rollover
│       ├── departureTax.js # Departure tax calculator
│       ├── amt.js          # Alternative minimum tax
│       └── windup88.js     # Section 88 wind-up
├── data/
│   └── 2025.json          # Tax rates and brackets
└── README.md
```

## Tax Calculations Included

### Individual Tax (T1)
- Employment income, dividends, capital gains
- Federal and provincial tax calculations
- Personal tax credits and deductions
- Marginal and effective tax rates

### Corporate Tax (T2)
- Small business deduction (SBD)
- General rate income
- GRIP and LRIP calculations
- Refundable tax mechanisms

### Corporate Capital Gains
- 50% inclusion rate
- Capital dividend account (CDA) additions
- Safe income bump analysis
- Refundable tax implications

### Death Tax & Estate Planning
- Deemed disposition at death
- Spousal rollover elections
- Estate valuation and tax planning
- Liquidity requirements

### Section 85 Rollover
- Tax-deferred property transfers
- Elected amount validation
- Boot and share consideration
- PUC grinding rules

### Departure Tax
- Emigration tax calculations
- Deemed disposition rules
- Security posting requirements
- Five-year deferral options

### Alternative Minimum Tax (AMT)
- 2024+ AMT reforms (20.5% rate, $173K exemption)
- Enhanced capital gains inclusion
- Credit carryforward tracking
- Preference item adjustments

### Section 88 Wind-up
- Corporate dissolution analysis
- Dividend distribution optimization
- RDTOH refund calculations
- Shareholder tax implications

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Tax Year

Currently configured for **2025 tax year** with:
- Updated federal and Quebec tax brackets
- Current basic personal amounts
- AMT reforms implementation
- Small business deduction rates

## Disclaimer

⚠️ **For educational purposes only.** This calculator provides estimates based on simplified tax rules. Always consult a qualified tax professional for actual tax planning and compliance.

## Development

To modify or extend the calculators:

1. **Add a new calculator:** Create a new file in `js/calculators/`
2. **Modify tax rates:** Edit `data/2025.json`
3. **Update styling:** Modify `css/styles.css`
4. **Add new features:** Extend `js/app.js`

No build process required - just edit the files and refresh your browser!

## License

Educational use only. Not for commercial tax preparation.

---

*Built with ❤️ and vanilla JavaScript* 