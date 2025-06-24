# 🍪 Cookie Tax

A professional suite of Canadian tax calculators for Quebec and Federal taxation, built with a clean, modern interface using vanilla HTML, CSS, and JavaScript.

This project provides a series of powerful, single-page tax planning tools designed for both educational purposes and professional reference.

## Features

- **9 Professional Tax Calculators:**
  - Individual Tax (T1)
  - Corporate Tax (T2)
  - Capital Gains
  - Death Tax
  - Section 85 Rollover
  - Departure Tax
  - Alternative Minimum Tax (AMT)
  - Corporate Wind-up (s.88)
- **Interactive Quiz Assistants:** Guided, step-by-step data entry for complex calculators like Death Tax, Departure Tax, and AMT.
- **Dynamic & Real-Time:** All calculations update instantly as you type.
- **Centralized Tax Rates:** All 2025 federal and Quebec tax rates are managed in a single `data/2025.json` file.
- **Clean & Modern UI:** A responsive, professional interface built with Bootstrap 5.
- **No Dependencies:** Runs directly in any modern browser with no build process.
- **Detailed Information:** Each calculator includes detailed commentary, legislative references, and links to CRA folios.
- **History & Notes:** Save calculation scenarios and add personal notes directly in your browser's local storage.

## Quick Start

1.  Clone or download this repository.
2.  Open `index.html` in your web browser.
3.  That's it! No servers, build steps, or dependencies are required.

## Project Structure

```
/
├── index.html              # Main application HTML file
├── css/styles.css          # Custom styling and theme
├── js/
│   ├── app.js              # Core application logic, UI rendering, state management
│   └── calculators/        # Modules for each individual calculator
│       ├── indTax.js
│       ├── corpTax.js
│       └── ... (and 6 more)
├── data/
│   └── 2025.json           # All tax brackets and rates
└── README.md
```

## Tax Calculations Overview

-   **Individual Tax (T1):** Calculates combined federal/Quebec tax on various income sources.
-   **Corporate Tax (T2):** Models tax on active and passive income, including SBD, GRIP, and LRIP.
-   **Capital Gains:** Determines tax for individuals or corporations, including CDA calculations.
-   **Death Tax:** Calculates tax on deemed disposition at death, with spousal rollover options.
-   **Section 85 Rollover:** Models tax-deferred property transfers to a corporation.
-   **Departure Tax:** Calculates deemed disposition tax for individuals emigrating from Canada.
-   **Alternative Minimum Tax (AMT):** Implements the 2024+ federal and Quebec AMT rules.
-   **Corporate Wind-up (s.88):** Analyzes the tax consequences of winding up a subsidiary.

## Disclaimer

⚠️ **For educational and informational purposes only.** This application provides estimates based on specific tax rules and should not be used as a substitute for professional tax advice. Always consult a qualified tax professional for personal or business tax planning and compliance.

---

*Built with vanilla JavaScript.* 