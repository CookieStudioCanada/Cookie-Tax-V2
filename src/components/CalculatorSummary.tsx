import React, { useState } from 'react';
import { useScenarioStore, CalculatorType } from '@/stores/useScenarioStore';

interface DetailModal {
  type: 'ita' | 'forms' | 'folios' | 'commentary' | 'notes' | null;
  calculatorKey: string | null;
}

interface CalculatorInfo {
  id: string;
  name: string;
  type: string;
  description: string;
  jurisdiction: string;
  inputs: string;
  outputs: string;
  details: {
    ita: Array<{ section: string; description: string }>;
    forms: Array<{ form: string; description: string }>;
    folios: Array<{ folio: string; description: string }>;
    commentary: string;
  };
}

interface CalculatorSummaryProps {
  onCalculatorSelect?: (calculatorType: CalculatorType) => void;
}

const CalculatorSummary: React.FC<CalculatorSummaryProps> = ({ onCalculatorSelect }) => {
  const { activeCalculator, setActiveCalculator, calculatorNotes, updateCalculatorNotes } = useScenarioStore();
  const [showModal, setShowModal] = useState<DetailModal>({ type: null, calculatorKey: null });
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const calculators: CalculatorInfo[] = [
    {
      id: 'indTax',
      name: 'Individual Tax',
      type: 'Personal',
      description: 'Calculate combined Quebec and Federal individual income tax with all major income types and personal tax credits.',
      jurisdiction: 'QC + Federal',
      inputs: 'employment income, dividends, capital gains, deductions',
      outputs: 'net tax, marginal rate, effective rate',
      details: {
        ita: [
          { section: 'ITA s.3', description: 'Income for the year from all sources' },
          { section: 'ITA s.117-118.9', description: 'Personal tax credits and rates' },
          { section: 'ITA s.121', description: 'Dividend tax credit mechanism' },
          { section: 'ITA s.38-55', description: 'Capital gains and losses provisions' }
        ],
        forms: [
          { form: 'T1 General', description: 'Individual Income Tax and Benefit Return' },
          { form: 'Schedule 1', description: 'Federal Tax calculation' },
          { form: 'TP-1', description: 'Quebec Income Tax Return' }
        ],
        folios: [
          { folio: 'S1-F2-C3', description: 'Scholarships, Research Grants and Other Education Assistance' },
          { folio: 'S1-F3-C1', description: 'Child Care Expense Deduction' },
          { folio: 'S1-F3-C2', description: 'Principal Residence' }
        ],
                 commentary: 'Individual taxation in Canada operates on a dual federal-provincial system with Quebec maintaining unique administrative independence. COMPREHENSIVE ANALYSIS: (1) INCOME CHARACTERIZATION: Employment income (s.5-8) triggers source deductions but allows limited deductions vs business income (s.9-37) permitting extensive write-offs but requiring GST/QST registration. Investment income faces complex integration - eligible dividends receive 38% gross-up with federal credit of 6/11ths and Quebec credit varying by income level. (2) QUEBEC INTEGRATION: Quebec administers both federal and provincial returns with distinct credit calculations. Quebec Pension Plan contributions differ from CPP, affecting pensionable earnings. Quebec Health Services Fund (HSF) applies to high earners. (3) TAX PLANNING STRATEGIES: Income splitting through spousal loans at prescribed rates (currently 3%), pension income splitting for residents 65+, RRSP/RRIF optimization considering withholding rates and clawback thresholds. (4) RECENT DEVELOPMENTS: Enhanced Canada Child Benefit reducing effective marginal rates for families, Alternative Minimum Tax strengthening (20.5% rate, $173K exemption, 100% capital gains inclusion), digital services tax implementation affecting gig workers. (5) PROFESSIONAL CONSIDERATIONS: Due diligence requirements for aggressive tax planning, CRA voluntary disclosure programs for non-compliance, and enhanced reporting for cryptocurrency transactions. Quebec maintains separate voluntary disclosure with different timelines and penalty structures.'
      }
    },
    {
      id: 'corpTax',
      name: 'Corporate Tax',
      type: 'Business',
      description: 'Calculate corporate income tax with small business deduction, refundable taxes, and dividend account integration.',
      jurisdiction: 'Federal + Provincial',
      inputs: 'active business income, SBD eligibility, refundable taxes',
      outputs: 'federal & provincial tax, GRIP/LRIP additions',
      details: {
        ita: [
          { section: 'ITA s.123-125', description: 'Basic corporate tax rates and small business deduction' },
          { section: 'ITA s.129', description: 'Dividend refund mechanism' },
          { section: 'ITA s.89', description: 'GRIP and eligible dividend designation' },
          { section: 'ITA s.186-187', description: 'Part IV tax on portfolio dividends' }
        ],
        forms: [
          { form: 'T2 Corporation', description: 'Income Tax Return for Corporations' },
          { form: 'Schedule 7', description: 'Calculation of Aggregate Investment Income' },
          { form: 'Schedule 27', description: 'Calculation of Refundable Dividend Tax on Hand' }
        ],
        folios: [
          { folio: 'S4-F15-C1', description: 'Manufacturing and Processing' },
          { folio: 'S4-F2-C1', description: 'Deductibility of Fines and Penalties' },
          { folio: 'S3-F6-C1', description: 'Interest Deductibility' }
        ],
                 commentary: 'Corporate taxation operates on integration theory where corporate tax represents prepayment of ultimate shareholder tax. DETAILED ANALYSIS: (1) SMALL BUSINESS DEDUCTION: Available on first $500K active business income for CCPCs with taxable capital under $10M. Associated corporation rules (s.256) aggregate income limits across related entities. Passive income threshold reduces SBD dollar-for-dollar when investment income exceeds $50K annually. Professional corporations qualify but face restrictions on income splitting and succession planning. (2) INTEGRATION MECHANICS: General rate 27% federally plus provincial (38-15-10+provincial rate). Small business rate 9% federal plus provincial (0-4.5%). Part IV tax 38⅓% on portfolio dividends creates refund mechanism. RDTOH tracking requires separate eligible/non-eligible pools post-2019. (3) DIVIDEND POLICY: GRIP additions from general rate income enable eligible dividend designation. CDA accumulates non-taxable amounts (½ capital gains, life insurance proceeds, dividends received). Capital dividend elections require unanimous director resolution within 3 years. (4) SUCCESSION PLANNING: Section 84.1 anti-avoidance prevents surplus stripping through capital gains. Lifetime capital gains exemption requires 24-month active business asset test. Estate freezes using preferred shares lock value for current generation. (5) COMPLIANCE EVOLUTION: Enhanced beneficial ownership reporting, transfer pricing documentation thresholds, aggressive tax position disclosure requirements. Provincial harmonization varies significantly - Quebec maintains separate corporate tax system with distinct rules for manufacturing, financial institutions, and resource sectors.'
      }
    },
    {
      id: 'corpCapGain',
      name: 'Corp Capital Gain',
      type: 'Investment',
      description: 'Calculate corporate capital gains with capital dividend account additions and refundable tax implications.',
      jurisdiction: 'Federal',
      inputs: 'proceeds, ACB, safe income bump, V-day values',
      outputs: 'taxable capital gain, CDA addition, refundable tax',
      details: {
        ita: [
          { section: 'ITA s.38-55', description: 'Capital gains and losses calculation' },
          { section: 'ITA s.83(2)', description: 'Capital dividend account and elections' },
          { section: 'ITA s.129(4)', description: 'Refundable taxes on investment income' },
          { section: 'ITA s.88(1)(d)', description: 'Safe income bump-up rules' }
        ],
        forms: [
          { form: 'T2 Schedule 6', description: 'Summary of Dispositions of Capital Property' },
          { form: 'T2057', description: 'Election to Treat Single Payment as Eligible Capital Property' },
          { form: 'T2054', description: 'Election to Capitalize Cost' }
        ],
        folios: [
          { folio: 'S4-F3-C1', description: 'Price Adjustment Clauses' },
          { folio: 'S4-F8-C1', description: 'Business Investment Losses' },
          { folio: 'S3-F9-C1', description: 'Lottery Winnings, Miscellaneous Receipts, and Income (and Losses) from Crime' }
        ],
                 commentary: 'Corporate capital gains create complex integration challenges requiring sophisticated planning. COMPREHENSIVE FRAMEWORK: (1) INCLUSION MECHANICS: 50% inclusion rate applies with non-taxable portion flowing to CDA. V-day values (December 31, 1971) establish cost base for pre-1972 property. Median rule may apply for publicly traded securities. Identical property rules aggregate costs across acquisitions. (2) REFUNDABLE TAX SYSTEM: Investment income faces additional 10⅔% federal refundable tax (Part I) plus 30⅔% aggregate investment income tax. Provincial refundable taxes vary by jurisdiction. NERDTOH accumulates non-eligible dividends and investment income taxes. Dividend refunds limited to Part IV tax and investment income taxes paid. (3) ANTI-AVOIDANCE PROVISIONS: Section 55(2) prevents capital gains strips through intercorporate dividends exceeding safe income. GAAR challenges artificial arrangements lacking commercial substance. Subsection 245(2) applies where transactions primarily seek tax benefits. (4) STRATEGIC CONSIDERATIONS: Timing dividend distributions to optimize refunds before taxation changes. CDA elections maximize tax-free distributions to shareholders. Loss utilization strategies consider separate company structures. International aspects involve foreign affiliate surplus and controlled foreign corporation rules. (5) VALUATION COMPLEXITIES: Fair market value determinations require qualified appraisals for private company shares. Discounts may apply for minority interests and marketability restrictions. Price adjustment clauses provide flexibility for uncertain valuations. Transfer pricing rules apply to non-arm\'s length transactions with detailed documentation requirements.'
      }
    },

    {
      id: 'rollover85',
      name: 'Section 85 Rollover',
      type: 'Reorganization',
      description: 'Calculate tax-deferred transfer of property to corporation with elected proceeds and boot considerations.',
      jurisdiction: 'Federal + Provincial',
      inputs: 'property FMV, ACB, elected amount, boot received',
      outputs: 'gain/loss recognition, share cost base, PUC',
      details: {
        ita: [
          { section: 'ITA s.85(1)', description: 'Transfer of property to corporation' },
          { section: 'ITA s.85(2)', description: 'Election requirements and filing' },
          { section: 'ITA s.85(1)(g)', description: 'Cost of shares received' },
          { section: 'ITA s.84.1', description: 'Non-arm\'s length share transfers' }
        ],
        forms: [
          { form: 'T2057', description: 'Election on Disposition of Property by a Taxpayer to a Taxable Canadian Corporation' },
          { form: 'T2058', description: 'Election on Disposition of Property by a Partnership to a Taxable Canadian Corporation' }
        ],
        folios: [
          { folio: 'S4-F7-C1', description: 'Amalgamations of Canadian Corporations' },
          { folio: 'S4-F3-C1', description: 'Price Adjustment Clauses' }
        ],
                 commentary: 'Section 85 rollover facilitates tax-deferred property transfers to corporations, forming the backbone of Canadian corporate reorganizations. TECHNICAL MASTERY: (1) ELECTION MECHANICS: Joint election required between transferor and corporation within 6 months of taxation year end. Elected amount creates "safety zone" between ACB (minimum) and FMV (maximum). Boot received immediately taxable to extent exceeding elected amount. Late filing penalties equal 0.25% monthly of benefit derived. (2) CONSIDERATION ANALYSIS: Share consideration cost equals elected amount minus boot received. PUC grinding rules in 85(2.1) reduce paid-up capital to prevent surplus stripping. Non-share consideration includes debt, cash, and assumption of liabilities. Multiple property transfers require separate elections with aggregate consideration allocation. (3) STRATEGIC APPLICATIONS: Business incorporation allows income splitting, multiplication of lifetime capital gains exemption, estate freezing through preferred share structures. Investment holding company creation enables family wealth transfer while maintaining control. Professional corporation establishment permits income deferral and retirement savings enhancement. (4) ANTI-AVOIDANCE IMPLICATIONS: Section 84.1 deems dividend treatment for non-arm\'s length share transfers where proceeds exceed greater of PUC and ACB. GAAR challenges artificial arrangements creating unintended tax benefits. Robichaud decision established substance over form requirements for section 85 elections. Recent CRA positions emphasize beneficial ownership verification and commercial rationale documentation. (5) COMPLIANCE SOPHISTICATION: Transfer pricing rules apply to non-arm\'s length property transfers requiring fair market value support. International implications include controlled foreign corporation designation and foreign affiliate surplus classification affecting future distributions and dispositions.'
      }
    },
    {
      id: 'departureTax',
    name: 'Departure Tax',
      type: 'International',
      description: 'Calculate deemed disposition tax on emigration from Canada with available elections and security posting.',
      jurisdiction: 'Federal',
      inputs: 'FMV at departure, ACB, exemptions claimed',
      outputs: 'deemed disposition gain, tax payable, security required',
      details: {
        ita: [
          { section: 'ITA s.128.1(4)', description: 'Deemed disposition on emigration' },
          { section: 'ITA s.220(4.5)', description: 'Security for departure tax' },
          { section: 'ITA s.128.1(4)(d)', description: 'Exemptions from deemed disposition' },
          { section: 'ITA s.119', description: 'Former resident - earned in Canada income' }
        ],
        forms: [
          { form: 'T1161', description: 'List of Properties by an Emigrant of Canada' },
          { form: 'T1243', description: 'Deemed Disposition of Property by an Emigrant of Canada' },
          { form: 'T1244', description: 'Election, under Subsection 220(4.5) of the Income Tax Act, to Defer the Payment of Income Tax' }
        ],
        folios: [
          { folio: 'S5-F1-C1', description: 'Determining an Individual\'s Residence Status' },
          { folio: 'S5-F2-C1', description: 'Foreign Tax Credit' }
        ],
                 commentary: 'Departure tax under section 128.1(4) represents Canada\'s exit tax preventing tax-free realization of Canadian-source accrued gains. EMIGRATION COMPLEXITIES: (1) DEEMED DISPOSITION MECHANICS: Emigration triggers deemed disposition at fair market value immediately before departure. Taxable capital gains arise on worldwide property except specifically exempted assets. Departure date determination considers tie-breaking rules and tax treaty provisions. Multiple departure events may occur for trusts and corporations under different circumstances. (2) EXEMPTED PROPERTY ANALYSIS: Canadian real property maintains Canadian tax nexus regardless of residency. Principal residence exemption subject to change-in-use rules and time-based limitations. Property of carrying on business in Canada through permanent establishment remains exempt. Rights under registered pension plans, RRSPs, and RRIFs generally exempt but subject to withholding tax on distributions. (3) SECURITY POSTING PROVISIONS: Section 220(4.5) permits tax deferral through adequate security posting. Security forms include letters of credit, bonds, guarantees, or cash deposits. Interest continues accruing on deferred amounts at prescribed rates. Five-year limitation period applies unless property disposed of earlier. (4) INTERNATIONAL CONSIDERATIONS: Tax treaty tie-breaker rules may override domestic residence determination. Foreign tax credit planning necessary to prevent double taxation. Controlled foreign corporation rules may apply to emigrating shareholders. Transfer pricing implications for departing beneficial owners of multinational structures. (5) SOPHISTICATED PLANNING: Pre-emigration realization may optimize Canadian tax rates vs foreign jurisdiction rates. Trust arrangements require careful analysis of beneficiary vs settlor emigration consequences. Estate planning coordination essential for families with international mobility. Voluntary disclosure considerations for non-compliance with departure tax reporting requirements.'
      }
    },
    {
      id: 'amt',
      name: 'Alternative Minimum Tax',
      type: 'Anti-Avoidance',
      description: 'Calculate Alternative Minimum Tax to ensure minimum tax contribution from high-income earners.',
      jurisdiction: 'Federal',
      inputs: 'regular tax, AMT adjustments, basic exemption',
      outputs: 'AMT liability, carryforward credits',
      details: {
        ita: [
          { section: 'ITA s.127.5-127.55', description: 'Alternative minimum tax calculation' },
          { section: 'ITA s.120.2', description: 'Minimum tax carryover' },
          { section: 'ITA Reg. 204', description: 'Prescribed amounts for AMT' }
        ],
        forms: [
          { form: 'T691', description: 'Alternative Minimum Tax' },
          { form: 'Schedule 12', description: 'Alternative Minimum Tax for Individuals' }
        ],
        folios: [
          { folio: 'S2-F1-C1', description: 'Education and Textbook Tax Credits' }
        ],
                 commentary: 'Alternative Minimum Tax underwent transformative 2024 reforms targeting high-income tax planning sophistication. REVOLUTIONARY CHANGES: (1) STRUCTURAL OVERHAUL: Basic exemption increased to $173,000 (indexed annually) from $40,000. Tax rate raised to 20.5% from 15% creating meaningful minimum tax floor. Adjusted taxable income calculation expanded dramatically to capture previously exempt preferences. Seven-year carryforward period maintains credit utilization when regular tax exceeds AMT in future years. (2) ENHANCED ADJUSTMENTS: Capital gains inclusion increased to 100% vs 50% regular rate, effectively doubling capital gains AMT burden. Employee stock option benefits 30% inclusion vs previous exemption creates significant impact for technology and startup executives. Charitable donation credit limited to 50% of AMT payable vs unlimited regular tax credits. Resource allowance, CCA claims, and other tax shelter preferences face enhanced restrictions. (3) SOPHISTICATED TARGETING: Private corporation shareholders face intensified scrutiny through dividend gross-up adjustments. Trust and partnership income allocation receives enhanced attention preventing income splitting abuse. Complex derivative instruments and structured products subject to character recharacterization preventing artificial loss creation. Professional corporation arrangements face limitations on income splitting and compensation optimization. (4) COMPLIANCE EVOLUTION: Enhanced reporting requirements for AMT taxpayers including detailed preference breakdowns. Voluntary disclosure implications for historical non-compliance with AMT obligations. Transfer pricing impact for multinational executives with cross-border compensation arrangements. Estate planning implications require comprehensive AMT modeling for intergenerational wealth transfer strategies. (5) STRATEGIC ADAPTATION: Tax planning must incorporate AMT sensitivity analysis for high-net-worth individuals. Timing strategies require multi-year modeling considering AMT credit carryforward optimization. Investment portfolio construction must balance regular tax efficiency with AMT minimization objectives creating tension in traditional tax-preferred investments.'
      }
    },
    {
      id: 'windup88',
      name: 'Section 88 Wind-up',
      type: 'Reorganization',
      description: 'Calculate tax implications of subsidiary winding-up including asset bump-ups and loss utilization.',
      jurisdiction: 'Federal',
      inputs: 'share cost, assets received, losses available',
      outputs: 'deemed dividend, asset cost bumps, loss continuity',
      details: {
        ita: [
          { section: 'ITA s.88(1)', description: 'Winding-up of Canadian corporation' },
          { section: 'ITA s.88(1)(c)', description: 'Cost of property distributed' },
          { section: 'ITA s.88(1)(d)', description: 'Bump-up of cost base' },
          { section: 'ITA s.88(1.1)-(1.5)', description: 'Loss restriction and utilization rules' }
        ],
        forms: [
          { form: 'T2 Final Return', description: 'Final corporate tax return' },
          { form: 'T5013', description: 'Statement of Partnership Income' }
        ],
        folios: [
          { folio: 'S4-F7-C1', description: 'Amalgamations of Canadian Corporations' },
          { folio: 'S4-F8-C1', description: 'Business Investment Losses' }
        ],
                 commentary: 'Section 88(1) winding-up represents the most sophisticated corporate liquidation mechanism in Canadian tax law, enabling tax-deferred subsidiary dissolution with complex integration features. ADVANCED MECHANICS: (1) LIQUIDATION FRAMEWORK: Parent corporation (90%+ ownership) receives subsidiary assets at tax cost preserving historical tax characteristics. Fair market value exceeding aggregate cost creates bump-up room allocable to capital property based on relative fair market values. Deemed dividend treatment applies to excess liquidating distributions over paid-up capital and share cost with integration through dividend refund mechanism. Two-year liquidation period provides flexibility for complex asset transfers and allows installment distributions. (2) LOSS CONTINUITY SOPHISTICATION: Non-capital losses continue subject to same business requirement and acquisition of control restrictions. Capital losses maintain character but face streaming rules preventing selective utilization. Business investment losses require separate tracking and may convert to capital losses upon wind-up. Farm losses and limited partnership losses face additional restrictions requiring agricultural activity continuation. (3) ANTI-AVOIDANCE COMPLEXITY: GAAR application scrutinizes artificial arrangements designed primarily for loss utilization without genuine business purpose. Loss trading restrictions prevent acquisition of corporations solely for tax attributes. Kidder Steuart analysis requires substance over form evaluation for series of transactions. Recent emphasis on economic substance and business purpose documentation. (4) INTERNATIONAL IMPLICATIONS: Foreign affiliate wind-ups require separate analysis under section 95 and foreign affiliate surplus calculations. Controlled foreign corporation implications for beneficial ownership and income attribution. Transfer pricing considerations for cross-border liquidation transactions. Tax treaty benefits may modify deemed dividend treatment and withholding tax obligations. (5) STRATEGIC SUCCESSION PLANNING: Estate planning applications enable intergenerational wealth transfer while preserving tax attributes. Professional practice wind-ups require consideration of work-in-progress and restrictive covenant treatment. Investment holding company liquidations optimize dividend refund and capital dividend account utilization. Multi-tier wind-ups require careful sequencing to maximize bump-up room allocation and minimize deemed dividend treatment ensuring optimal integration of multiple corporate levels.'
      }
    }
  ];

  const handleDetailModal = (type: DetailModal['type'], calculatorKey: string) => {
    setShowModal({ type, calculatorKey });
  };

  const handleNotesEdit = (calculatorKey: string) => {
    setEditingNotes(calculatorKey);
    setTempNotes(calculatorNotes[calculatorKey] || '');
  };

  const handleNotesSave = (calculatorKey: string) => {
    updateCalculatorNotes(calculatorKey, tempNotes);
    setEditingNotes(null);
    setTempNotes('');
  };

  const handleNotesCancel = () => {
    setEditingNotes(null);
    setTempNotes('');
  };

     const getEnhancedCommentary = (calculator: CalculatorInfo) => {
     switch (calculator.id) {
       case 'indTax':
  return (
           <div className="commentary-content">
             <div className="commentary-section mb-5">
               <h4 className="commentary-title">📊 2025 Tax Rates & Brackets</h4>
               <div className="row">
                 <div className="col-md-6">
                   <div className="rate-table federal-rates">
                     <h6 className="table-title">🇨🇦 Federal Rates</h6>
                     <ul className="rate-list">
                       <li><span className="rate">15%</span> on first <strong>$55,867</strong></li>
                       <li><span className="rate">20.5%</span> on <strong>$55,868 - $111,733</strong></li>
                       <li><span className="rate">26%</span> on <strong>$111,734 - $173,205</strong></li>
                       <li><span className="rate">29%</span> on <strong>$173,206 - $246,752</strong></li>
                       <li><span className="rate highlight-rate">33%</span> on income over <strong>$246,752</strong></li>
                     </ul>
                   </div>
                 </div>
                 <div className="col-md-6">
                   <div className="rate-table quebec-rates">
                     <h6 className="table-title">⚜️ Quebec Rates</h6>
                     <ul className="rate-list">
                       <li><span className="rate">14%</span> on first <strong>$51,780</strong></li>
                       <li><span className="rate">19%</span> on <strong>$51,781 - $103,545</strong></li>
                       <li><span className="rate">24%</span> on <strong>$103,546 - $126,000</strong></li>
                       <li><span className="rate highlight-rate">25.75%</span> on income over <strong>$126,000</strong></li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="commentary-section mb-5">
               <h4 className="commentary-title">💡 Practical Tax Calculation</h4>
               <div className="example-box">
                 <h6 className="example-title">Quebec Resident - $150,000 Employment Income</h6>
                 <div className="calculation-breakdown">
                   <div className="calc-line">
                     <span className="calc-label">Federal Tax:</span>
                     <span className="calc-amount">$26,430</span>
                     <span className="calc-rate">(17.6% effective)</span>
                   </div>
                   <div className="calc-line">
                     <span className="calc-label">Quebec Tax:</span>
                     <span className="calc-amount">$20,357</span>
                     <span className="calc-rate">(13.6% effective)</span>
                   </div>
                   <div className="calc-line total-line">
                     <span className="calc-label">Total Tax:</span>
                     <span className="calc-amount highlight">$46,787</span>
                     <span className="calc-rate highlight">(31.2% effective)</span>
                   </div>
                   <div className="marginal-rate">
                     <strong>Marginal Rate: 50.75%</strong> (26% Federal + 24.75% Quebec)
                   </div>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">🎯 Advanced Tax Planning Strategies</h4>
               
               <div className="strategy-section">
                 <h5 className="strategy-title">Income Splitting Opportunities</h5>
                 <ul className="strategy-list">
                   <li><strong>Spousal Loans:</strong> Prescribed rate loans at 3% for 2025 enable income attribution to lower-earning spouse</li>
                   <li><strong>Pension Splitting:</strong> Up to 50% of eligible pension income for taxpayers 65+ or receiving pension due to death</li>
                   <li><strong>Family Trusts:</strong> Income distribution to adult children in lower tax brackets (subject to kiddie tax rules)</li>
                 </ul>
               </div>

               <div className="strategy-section">
                 <h5 className="strategy-title">RRSP vs TFSA Optimization</h5>
                 <div className="comparison-table">
                   <div className="comparison-item">
                     <strong>RRSP Advantages:</strong>
                     <ul>
                       <li>Immediate tax deduction at marginal rate</li>
                       <li>Tax-deferred growth until withdrawal</li>
                       <li>Optimal for high earners expecting lower retirement income</li>
                     </ul>
                   </div>
                   <div className="comparison-item">
                     <strong>TFSA Advantages:</strong>
                     <ul>
                       <li>Tax-free growth and withdrawals</li>
                       <li>No impact on OAS clawback or GIS eligibility</li>
                       <li>Contribution room recovers year after withdrawal</li>
                     </ul>
                   </div>
                 </div>
               </div>

               <div className="strategy-section">
                 <h5 className="strategy-title">Quebec-Specific Considerations</h5>
                 <ul className="strategy-list">
                   <li><strong>Health Services Fund (HSF):</strong> Additional 1% tax on employment income over $18,570</li>
                   <li><strong>Quebec Pension Plan:</strong> Different contribution rates and maximum pensionable earnings than CPP</li>
                   <li><strong>Separate Tax Returns:</strong> Quebec administers both federal and provincial taxes with distinct credit calculations</li>
                   <li><strong>Quebec Stock Savings Plan:</strong> 150% deduction for eligible Quebec corporations</li>
                 </ul>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">⚖️ Legal Framework & Recent Changes</h4>
               
               <div className="legal-section">
                 <h5 className="legal-title">Alternative Minimum Tax (AMT) Reform 2024</h5>
                 <div className="legal-content">
                   <p>Significant strengthening of AMT targeting high-income taxpayers:</p>
                   <ul className="legal-list">
                     <li>Basic exemption increased to <strong>$173,000</strong> (previously $40,000)</li>
                     <li>Tax rate raised to <strong>20.5%</strong> (previously 15%)</li>
                     <li>Capital gains inclusion rate increased to <strong>100%</strong> for AMT purposes</li>
                     <li>Employee stock options subject to <strong>30% inclusion</strong></li>
                     <li>Charitable donation credits limited to <strong>50% of AMT payable</strong></li>
                   </ul>
                 </div>
               </div>

               <div className="legal-section">
                 <h5 className="legal-title">Digital Services Tax Implementation</h5>
                 <div className="legal-content">
                   <p>New 3% tax on digital services revenue affecting gig economy workers and digital platforms, impacting income characterization and GST/QST obligations.</p>
                 </div>
               </div>
             </div>

             <div className="commentary-section">
               <h4 className="commentary-title">📈 Professional Practice Points</h4>
               
               <div className="practice-points">
                 <div className="point-category">
                   <h6 className="point-title">Due Diligence Requirements</h6>
                   <ul>
                     <li>Enhanced CRA scrutiny of aggressive tax planning arrangements</li>
                     <li>Mandatory disclosure requirements for reportable transactions</li>
                     <li>Professional liability considerations for tax advisors</li>
                   </ul>
                 </div>

                 <div className="point-category">
                   <h6 className="point-title">Technology & Compliance</h6>
                   <ul>
                     <li>Cryptocurrency taxation requires detailed transaction tracking</li>
                     <li>Work-from-home expenses permanent deduction methods</li>
                     <li>Digital asset reporting on T1135 for foreign property over $100,000</li>
                   </ul>
                 </div>
               </div>
             </div>


           </div>
         );
       
       case 'corpTax':
         return (
           <div className="commentary-content">
             <div className="commentary-section mb-5">
               <h4 className="commentary-title">📊 2025 Corporate Tax Rates</h4>
               <div className="row">
                 <div className="col-md-6">
                   <div className="rate-table federal-rates">
                     <h6 className="table-title">🇨🇦 Federal Rates</h6>
                     <ul className="rate-list">
                       <li><span className="rate">9%</span> Small Business (first <strong>$500,000 ABI</strong>)</li>
                       <li><span className="rate">15%</span> General Rate (after GRR)</li>
                       <li><span className="rate">38⅓%</span> Part IV Tax (portfolio dividends)</li>
                       <li><span className="rate highlight-rate">50⅔%</span> Investment Income (inc. refundable)</li>
                     </ul>
                   </div>
                 </div>
                 <div className="col-md-6">
                   <div className="rate-table quebec-rates">
                     <h6 className="table-title">⚜️ Quebec Rates</h6>
                     <ul className="rate-list">
                       <li><span className="rate">3.2%</span> Small Business Rate</li>
                       <li><span className="rate">11.5%</span> General Corporate Rate</li>
                       <li><span className="rate highlight-rate">12.2%</span> Combined Small Business</li>
                       <li><span className="rate highlight-rate">26.5%</span> Combined General Rate</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-5">
               <h4 className="commentary-title">🏢 Small Business Deduction Mechanics</h4>
               <div className="legal-section">
                 <h5 className="legal-title">Eligibility Requirements</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>CCPC Status:</strong> Must be Canadian-controlled private corporation</li>
                     <li><strong>Taxable Capital:</strong> Corporation and associated corporations must have taxable capital under $10 million</li>
                     <li><strong>Active Business Income:</strong> Maximum $500,000 annually across associated group</li>
                     <li><strong>Passive Income Threshold:</strong> SBD reduces dollar-for-dollar when aggregate investment income exceeds $50,000</li>
                   </ul>
                 </div>
               </div>
               
               <div className="legal-section">
                 <h5 className="legal-title">Association Rules (ITA s.256)</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Control Test:</strong> Corporations controlled by same person or group</li>
                     <li><strong>Cross-Ownership:</strong> One corporation controls another</li>
                     <li><strong>Related Persons:</strong> Corporations controlled by related individuals</li>
                     <li><strong>Deemed Association:</strong> Third-party control through agreements or arrangements</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">💰 Refundable Tax System</h4>
               
               <div className="strategy-section">
                 <h5 className="strategy-title">RDTOH Calculation (Post-2019)</h5>
                 <div className="comparison-table">
                   <div className="comparison-item">
                     <strong>Eligible RDTOH:</strong>
                     <ul>
                       <li>Part IV tax on eligible dividends received</li>
                       <li>30⅔% of net eligible dividends paid</li>
                       <li>Refund rate: 38⅓% of eligible dividends paid</li>
                     </ul>
                   </div>
                   <div className="comparison-item">
                     <strong>Non-Eligible RDTOH:</strong>
                     <ul>
                       <li>Part I refundable tax (10⅔% on investment income)</li>
                       <li>Part IV tax on non-eligible dividends</li>
                       <li>Refund rate: 38⅓% of non-eligible dividends paid</li>
                     </ul>
                   </div>
                 </div>
               </div>

               <div className="strategy-section">
                 <h5 className="strategy-title">GRIP vs LRIP Mechanics</h5>
                 <ul className="strategy-list">
                   <li><strong>GRIP Addition:</strong> 72% of income subject to general corporate tax rate</li>
                   <li><strong>GRIP Reduction:</strong> Eligible dividends paid reduce GRIP balance</li>
                   <li><strong>LRIP Addition:</strong> Primarily non-eligible dividends received and small business income</li>
                   <li><strong>Election Requirement:</strong> Must elect eligible dividend status within specified timeframes</li>
                 </ul>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">⚖️ Legislative Framework</h4>
               
               <div className="legal-section">
                 <h5 className="legal-title">Key Statutory Provisions</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>ITA s.123:</strong> Basic federal corporate tax rate (38%)</li>
                     <li><strong>ITA s.123.4:</strong> Federal abatement (10%) and general rate reduction (13%)</li>
                     <li><strong>ITA s.125:</strong> Small business deduction calculation</li>
                     <li><strong>ITA s.129:</strong> Dividend refund mechanism and RDTOH</li>
                     <li><strong>ITA s.89:</strong> GRIP calculation and eligible dividend designation</li>
                   </ul>
                 </div>
               </div>

               <div className="legal-section">
                 <h5 className="legal-title">Recent Reforms (2016-2024)</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Passive Income Rules:</strong> SBD grinding for investment income over $50,000</li>
                     <li><strong>Split RDTOH:</strong> Separate tracking for eligible and non-eligible dividends</li>
                     <li><strong>Tax on Split Income (TOSI):</strong> Enhanced rules for private corporation distributions</li>
                     <li><strong>Loss Restriction:</strong> Enhanced acquisition of control provisions</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section">
               <h4 className="commentary-title">📈 Compliance Requirements</h4>
               
               <div className="practice-points">
                 <div className="point-category">
                   <h6 className="point-title">Filing Obligations</h6>
                   <ul>
                     <li>T2 Corporate Income Tax Return (6 months after year-end)</li>
                     <li>Schedule 7: Aggregate investment income calculation</li>
                     <li>Schedule 27: RDTOH computation</li>
                     <li>Provincial corporate tax returns (various deadlines)</li>
                   </ul>
                 </div>

                 <div className="point-category">
                   <h6 className="point-title">Advanced Reporting</h6>
                   <ul>
                     <li>Transfer pricing documentation (&gt;$1M transactions)</li>
                     <li>Country-by-country reporting (&gt;$750M revenue)</li>
                     <li>Beneficial ownership registry compliance</li>
                     <li>GIFI standardized financial information</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         );
       
       case 'corpCapGain':
         return (
           <div className="commentary-content">
             <div className="commentary-section mb-5">
               <h4 className="commentary-title">📊 Capital Gains Tax Framework</h4>
               <div className="row">
                 <div className="col-md-6">
                   <div className="rate-table federal-rates">
                     <h6 className="table-title">🎯 Inclusion Rates</h6>
                     <ul className="rate-list">
                       <li><span className="rate">50%</span> Regular inclusion rate</li>
                       <li><span className="rate">100%</span> AMT inclusion rate (2024+)</li>
                       <li><span className="rate">0%</span> Non-taxable portion to CDA</li>
                       <li><span className="rate highlight-rate">30⅔%</span> Additional refundable tax</li>
                     </ul>
                   </div>
                 </div>
                 <div className="col-md-6">
                   <div className="rate-table quebec-rates">
                     <h6 className="table-title">💰 Tax Calculation</h6>
                     <ul className="rate-list">
                       <li><span className="rate">26.67%</span> Federal rate on gains</li>
                       <li><span className="rate">11.9%</span> Quebec rate on gains</li>
                       <li><span className="rate highlight-rate">38.57%</span> Combined effective rate</li>
                       <li><span className="rate">10⅔%</span> Part I refundable tax</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-5">
               <h4 className="commentary-title">🏛️ Capital Dividend Account (CDA)</h4>
               <div className="legal-section">
                 <h5 className="legal-title">CDA Components (ITA s.89(1))</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Capital Gains:</strong> Non-taxable portion (50%) of net capital gains</li>
                     <li><strong>Life Insurance:</strong> Proceeds less adjusted cost basis</li>
                     <li><strong>Capital Dividends Received:</strong> From other Canadian corporations</li>
                     <li><strong>Eligible Capital Property:</strong> Pre-2017 transitional amounts</li>
                   </ul>
                 </div>
               </div>
               
               <div className="legal-section">
                 <h5 className="legal-title">Capital Dividend Election Requirements</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Form T2054:</strong> Election must be filed within 3 years</li>
                     <li><strong>Director Resolution:</strong> Unanimous board resolution required</li>
                     <li><strong>Timing:</strong> Election before or on payment date</li>
                     <li><strong>CDA Balance:</strong> Cannot exceed available CDA at payment time</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">💼 Refundable Tax on Investment Income</h4>
               
               <div className="strategy-section">
                 <h5 className="strategy-title">RDTOH Calculation</h5>
                 <div className="comparison-table">
                   <div className="comparison-item">
                     <strong>Part I Refundable Tax:</strong>
                     <ul>
                       <li>10⅔% on aggregate investment income</li>
                       <li>Includes: taxable capital gains, portfolio dividends, interest</li>
                       <li>Excludes: capital dividends, non-taxable gains</li>
                     </ul>
                   </div>
                   <div className="comparison-item">
                     <strong>Refund Mechanism:</strong>
                     <ul>
                       <li>38⅓% refund on non-eligible dividends paid</li>
                       <li>Tracked in Non-Eligible RDTOH account</li>
                       <li>Maximum refund limited to RDTOH balance</li>
                     </ul>
                   </div>
                 </div>
               </div>

               <div className="strategy-section">
                 <h5 className="strategy-title">Aggregate Investment Income Definition</h5>
                 <ul className="strategy-list">
                   <li><strong>Taxable Capital Gains:</strong> Net gains from disposition of capital property</li>
                   <li><strong>Income from Property:</strong> Interest, rents, royalties (minus expenses)</li>
                   <li><strong>Portfolio Dividends:</strong> Dividends from non-connected corporations (&lt;10% ownership)</li>
                   <li><strong>Foreign Investment Income:</strong> Subject to same treatment as domestic</li>
                 </ul>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">⚖️ Valuation and Anti-Avoidance</h4>
               
               <div className="legal-section">
                 <h5 className="legal-title">Fair Market Value Determination</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Definition:</strong> Highest price obtainable in open market between willing parties</li>
                     <li><strong>Professional Appraisal:</strong> Required for significant private company transactions</li>
                     <li><strong>Valuation Date:</strong> As of disposition date, not agreement date</li>
                     <li><strong>Price Adjustment Clauses:</strong> Permitted if genuine uncertainty exists</li>
                   </ul>
                 </div>
               </div>

               <div className="legal-section">
                 <h5 className="legal-title">Section 55 Anti-Avoidance</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Capital Gains Strip:</strong> Prevents conversion of dividends to capital gains</li>
                     <li><strong>Safe Income Test:</strong> Dividends exceeding safe income recharacterized</li>
                     <li><strong>Connected Corporation:</strong> &gt;10% ownership by votes and value</li>
                     <li><strong>Series of Transactions:</strong> Broad interpretation by courts and CRA</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section">
               <h4 className="commentary-title">📈 Compliance and Reporting</h4>
               
               <div className="practice-points">
                 <div className="point-category">
                   <h6 className="point-title">Required Schedules</h6>
                   <ul>
                     <li>Schedule 6: Summary of Dispositions of Capital Property</li>
                     <li>Schedule 7: Aggregate Investment Income calculation</li>
                     <li>Schedule 27: RDTOH computation</li>
                     <li>T5013A: Partnership income allocation (if applicable)</li>
                   </ul>
                 </div>

                 <div className="point-category">
                   <h6 className="point-title">Documentation Requirements</h6>
                   <ul>
                     <li>Purchase and sale agreements with fair market value support</li>
                     <li>Professional appraisals for private company shares</li>
                     <li>CDA calculation and election documentation</li>
                     <li>Transfer pricing documentation for related party transactions</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         );

       case 'amt':
         return (
           <div className="commentary-content">
             <div className="commentary-section mb-5">
               <h4 className="commentary-title">📊 2024 AMT Reform Overview</h4>
               <div className="row">
                 <div className="col-md-6">
                   <div className="rate-table federal-rates">
                     <h6 className="table-title">🎯 New AMT Structure</h6>
                     <ul className="rate-list">
                       <li><span className="rate">20.5%</span> AMT rate (was 15%)</li>
                       <li><span className="rate">$173,000</span> Basic exemption (was $40,000)</li>
                       <li><span className="rate">100%</span> Capital gains inclusion</li>
                       <li><span className="rate highlight-rate">7 years</span> Credit carryforward</li>
                     </ul>
                   </div>
                 </div>
                 <div className="col-md-6">
                   <div className="rate-table quebec-rates">
                     <h6 className="table-title">📈 Income Adjustments</h6>
                     <ul className="rate-list">
                       <li><span className="rate">30%</span> Employee stock options</li>
                       <li><span className="rate">50%</span> Charitable donation limit</li>
                       <li><span className="rate">80%</span> Non-capital loss restriction</li>
                       <li><span className="rate highlight-rate">30%</span> CCA/resource deductions</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-5">
               <h4 className="commentary-title">🔍 Adjusted Taxable Income Calculation</h4>
               <div className="legal-section">
                 <h5 className="legal-title">Income Additions (ITA s.127.52)</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Capital Gains:</strong> 100% inclusion vs 50% regular rate</li>
                     <li><strong>Stock Options:</strong> 30% of benefit amount added back</li>
                     <li><strong>Losses:</strong> 80% restriction on non-capital loss deductions</li>
                     <li><strong>Depletion:</strong> 30% of resource and depletion allowances added</li>
                   </ul>
                 </div>
               </div>
               
               <div className="legal-section">
                 <h5 className="legal-title">Credit Limitations</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Charitable Donations:</strong> Limited to 50% of AMT payable (was 100%)</li>
                     <li><strong>Political Contributions:</strong> Same 50% limitation applies</li>
                     <li><strong>Basic Personal Amount:</strong> Reduced to $30,000 for AMT purposes</li>
                     <li><strong>Other Credits:</strong> Various personal credits subject to restrictions</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">💰 AMT Credit System</h4>
               
               <div className="strategy-section">
                 <h5 className="strategy-title">Credit Calculation and Carryforward</h5>
                 <div className="comparison-table">
                   <div className="comparison-item">
                     <strong>AMT Credit Generation:</strong>
                     <ul>
                       <li>Excess of AMT over regular Part I tax</li>
                       <li>Available in years when regular tax exceeds AMT</li>
                       <li>7-year carryforward period (same as before)</li>
                     </ul>
                   </div>
                   <div className="comparison-item">
                     <strong>Credit Utilization:</strong>
                     <ul>
                       <li>Reduces regular tax to AMT level in utilization year</li>
                       <li>FIFO basis - oldest credits used first</li>
                       <li>No carryback of AMT credits permitted</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">⚖️ Legislative Framework</h4>
               
               <div className="legal-section">
                 <h5 className="legal-title">Key Statutory Provisions</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>ITA s.127.5:</strong> Obligation to pay minimum tax</li>
                     <li><strong>ITA s.127.51:</strong> Minimum amount calculation</li>
                     <li><strong>ITA s.127.52:</strong> Adjusted taxable income definition</li>
                     <li><strong>ITA s.127.531:</strong> Basic exemption and rate</li>
                   </ul>
                 </div>
               </div>

               <div className="legal-section">
                 <h5 className="legal-title">2024 Reform Rationale</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Revenue Enhancement:</strong> Estimated $3 billion additional revenue over 5 years</li>
                     <li><strong>Tax Shelter Targeting:</strong> Enhanced restrictions on tax preference items</li>
                     <li><strong>High-Income Focus:</strong> Primarily affects taxpayers with income &gt;$300,000</li>
                     <li><strong>Complexity Reduction:</strong> Simplified some calculations while expanding scope</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section">
               <h4 className="commentary-title">📈 Compliance Requirements</h4>
               
               <div className="practice-points">
                 <div className="point-category">
                   <h6 className="point-title">Filing and Calculation</h6>
                   <ul>
                     <li>Form T691: Alternative Minimum Tax calculation</li>
                     <li>Schedule 12: Detailed AMT computation</li>
                     <li>Annual recalculation required regardless of prior year results</li>
                     <li>Electronic filing mandatory for affected taxpayers</li>
                   </ul>
                 </div>

                 <div className="point-category">
                   <h6 className="point-title">Record Keeping</h6>
                   <ul>
                     <li>Detailed tracking of preference items and adjustments</li>
                     <li>AMT credit carryforward schedules</li>
                     <li>Fair market value documentation for capital property</li>
                     <li>Employee stock option benefit calculations</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         );

       case 'deathTax':
         return (
           <div className="commentary-content">
             <div className="commentary-section mb-5">
               <h4 className="commentary-title">⚰️ Death Tax & Estate Planning Framework</h4>
               <div className="row">
                 <div className="col-md-6">
                   <div className="rate-table federal-rates">
                     <h6 className="table-title">💀 Deemed Disposition Rules</h6>
                     <ul className="rate-list">
                       <li><span className="rate">FMV</span> Deemed proceeds at death</li>
                       <li><span className="rate">50%</span> Capital gains inclusion rate</li>
                       <li><span className="rate">100%</span> RRSP/RRIF inclusion</li>
                       <li><span className="rate highlight-rate">0%</span> TFSA taxation</li>
                     </ul>
                   </div>
                 </div>
                 <div className="col-md-6">
                   <div className="rate-table quebec-rates">
                     <h6 className="table-title">🏠 Principal Residence Exemption</h6>
                     <ul className="rate-list">
                       <li><span className="rate">Formula</span> (1 + years designated) / years owned</li>
                       <li><span className="rate">One</span> PR designation per family unit</li>
                       <li><span className="rate highlight-rate">$1M+</span> Lifetime capital gains exemption</li>
                       <li><span className="rate">Transfer</span> Spouse rollover provisions</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-5">
               <h4 className="commentary-title">📋 Estate Administration Framework</h4>
               <div className="legal-section">
                 <h5 className="legal-title">Filing Deadlines and Requirements</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Final Tax Return:</strong> April 30 of year following death (June 15 if business income)</li>
                     <li><strong>Rights or Things Return:</strong> Optional separate return for certain income</li>
                     <li><strong>Trust Returns:</strong> Graduate rate estate for first 36 months</li>
                     <li><strong>Clearance Certificate:</strong> Required before asset distribution to beneficiaries</li>
                   </ul>
                 </div>
               </div>
               
               <div className="legal-section">
                 <h5 className="legal-title">Probate and Administration Costs</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Ontario Probate Fees:</strong> 0.5% first $50K, 1.5% thereafter</li>
                     <li><strong>Alberta Probate Fees:</strong> Flat $400 regardless of estate value</li>
                     <li><strong>Executor Compensation:</strong> Typically 2.5-5% of estate value</li>
                     <li><strong>Legal and Professional Fees:</strong> 1-3% of estate value for administration</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">🛡️ Tax Planning Strategies</h4>
               
               <div className="strategy-section">
                 <h5 className="strategy-title">Spouse and Family Transfers</h5>
                 <div className="comparison-table">
                   <div className="comparison-item">
                     <strong>Spousal Rollover (ITA s.70(6)):</strong>
                     <ul>
                       <li>Automatic rollover at cost for qualifying property</li>
                       <li>Election out available to trigger capital gains</li>
                       <li>Applies to capital property, depreciable property, resource properties</li>
                       <li>Attribution rules may apply to subsequent dispositions</li>
                     </ul>
                   </div>
                   <div className="comparison-item">
                     <strong>Qualified Farm/Fishing Property:</strong>
                     <ul>
                       <li>$1,000,000 lifetime capital gains exemption (2024)</li>
                       <li>Intergenerational transfer provisions (ITA s.70(9))</li>
                       <li>Rollover to children at cost if continued use</li>
                       <li>Enhanced exemption for family farm corporations</li>
                     </ul>
                   </div>
                 </div>
               </div>

               <div className="strategy-section">
                 <h5 className="strategy-title">Trust and Estate Freezing Techniques</h5>
                 <ul className="strategy-list">
                   <li><strong>Alter Ego/Joint Spousal Trusts:</strong> Defer deemed disposition until trust termination</li>
                   <li><strong>Estate Freeze:</strong> Lock in current value, transfer growth to next generation</li>
                   <li><strong>Charitable Donations:</strong> 100% of net income limit (vs 75% lifetime), carry-forward 5 years</li>
                   <li><strong>Principal Residence Trust:</strong> Maintain PR designation through family trust</li>
                 </ul>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">⚖️ Legislative Framework</h4>
               
               <div className="legal-section">
                 <h5 className="legal-title">Key Statutory Provisions</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>ITA s.70(5):</strong> Deemed disposition at fair market value on death</li>
                     <li><strong>ITA s.70(6):</strong> Spousal and common-law partner rollover</li>
                     <li><strong>ITA s.70(9):</strong> Transfer to children of farm/fishing property</li>
                     <li><strong>ITA s.118.1:</strong> Charitable donation tax credits for estates</li>
                     <li><strong>ITA s.164(6):</strong> Loss carryback from estate to final return</li>
                   </ul>
                 </div>
               </div>

               <div className="legal-section">
                 <h5 className="legal-title">Provincial Variation and Considerations</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Probate Fees:</strong> Vary significantly by province (Alberta $400 vs BC 1.4%)</li>
                     <li><strong>Family Property Laws:</strong> Spousal property rights override tax elections</li>
                     <li><strong>Wills Variation:</strong> Provincial legislation allows court variation</li>
                     <li><strong>Intestacy Rules:</strong> Provincial succession laws for estates without wills</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">💼 Advanced Calculations</h4>
               
               <div className="legal-section">
                 <h5 className="legal-title">Alternative Minimum Tax Considerations</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Capital Gains Inclusion:</strong> 100% for AMT vs 50% regular tax</li>
                     <li><strong>AMT Exemption:</strong> $173,000 basic exemption (2024)</li>
                     <li><strong>AMT Rate:</strong> 20.5% on income above exemption</li>
                     <li><strong>Credit Carryforward:</strong> 7-year carryforward of excess AMT paid</li>
                   </ul>
                 </div>
               </div>

               <div className="legal-section">
                 <h5 className="legal-title">Reserve Provisions and Deferrals</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Capital Gains Reserve:</strong> 20% per year over 5 years for installment sales</li>
                     <li><strong>Rights or Things:</strong> Separate return election for accrued income</li>
                     <li><strong>Inventory Valuation:</strong> Special rules for business inventory at death</li>
                     <li><strong>Partnership Interests:</strong> Deemed realization of partnership income</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section">
               <h4 className="commentary-title">📈 Practical Implementation</h4>
               
               <div className="practice-points">
                 <div className="point-category">
                   <h6 className="point-title">Essential Documentation</h6>
                   <ul>
                     <li>Updated will with appropriate tax elections and directives</li>
                     <li>Power of attorney for property and personal care</li>
                     <li>Beneficiary designations on registered accounts (RRSP, RRIF, TFSA)</li>
                     <li>Joint ownership documentation and right of survivorship</li>
                   </ul>
                 </div>

                 <div className="point-category">
                   <h6 className="point-title">Professional Coordination</h6>
                   <ul>
                     <li>Estate lawyer for will preparation and probate applications</li>
                     <li>Tax professional for final returns and clearance certificates</li>
                     <li>Financial advisor for beneficiary designation optimization</li>
                     <li>Insurance specialist for estate liquidity planning</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         );

       case 'rollover85':
         return (
           <div className="commentary-content">
             <div className="commentary-section mb-5">
               <h4 className="commentary-title">📊 Section 85 Rollover Mechanics</h4>
               <div className="row">
                 <div className="col-md-6">
                   <div className="rate-table federal-rates">
                     <h6 className="table-title">🎯 Rollover Limits</h6>
                     <ul className="rate-list">
                       <li><span className="rate">≥</span> Greater of FMV of boot + ACB</li>
                       <li><span className="rate">≤</span> Fair market value of property</li>
                       <li><span className="rate">0</span> Minimum elected amount</li>
                       <li><span className="rate highlight-rate">No gain</span> At minimum election</li>
                     </ul>
                   </div>
                 </div>
                 <div className="col-md-6">
                   <div className="rate-table quebec-rates">
                     <h6 className="table-title">📋 Boot Limitations</h6>
                     <ul className="rate-list">
                       <li><span className="rate">FMV</span> Boot cannot exceed property FMV</li>
                       <li><span className="rate">Gain</span> Triggered if boot &gt; ACB</li>
                       <li><span className="rate highlight-rate">Cash</span> Common form of boot</li>
                       <li><span className="rate">Debt</span> Corporation assumes liabilities</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-5">
               <h4 className="commentary-title">🏛️ Eligible Property and Considerations</h4>
               <div className="legal-section">
                 <h5 className="legal-title">Eligible Property (ITA s.85(1.1))</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Capital Property:</strong> Including depreciable property and shares</li>
                     <li><strong>Eligible Capital Property:</strong> Pre-2017 goodwill and intangibles</li>
                     <li><strong>Inventory:</strong> Business inventory held for resale</li>
                     <li><strong>Canadian Resource Property:</strong> Oil, gas, and mineral properties</li>
                   </ul>
                 </div>
               </div>
               
               <div className="legal-section">
                 <h5 className="legal-title">Ineligible Property</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Cash and Cash Equivalents:</strong> Money, bank deposits, guaranteed investment certificates</li>
                     <li><strong>Accounts Receivable:</strong> Trade receivables from ordinary business</li>
                     <li><strong>Personal-Use Property:</strong> Property primarily for personal use or enjoyment</li>
                     <li><strong>Real Estate Held as Inventory:</strong> By non-residents (special rules apply)</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">💼 Tax Consequences and Calculations</h4>
               
               <div className="strategy-section">
                 <h5 className="strategy-title">Transferor Tax Consequences</h5>
                 <div className="comparison-table">
                   <div className="comparison-item">
                     <strong>Capital Property:</strong>
                     <ul>
                       <li>Proceeds = Elected amount</li>
                       <li>Capital gain/loss = Elected amount - ACB</li>
                       <li>Share cost base = Elected amount - boot</li>
                     </ul>
                   </div>
                   <div className="comparison-item">
                     <strong>Depreciable Property:</strong>
                     <ul>
                       <li>UCC reduction = Lesser of elected amount and UCC</li>
                       <li>Recapture if elected amount &gt; UCC</li>
                       <li>Terminal loss denied on transfer to non-arm's length</li>
                     </ul>
                   </div>
                 </div>
               </div>

               <div className="strategy-section">
                 <h5 className="strategy-title">Corporation Tax Consequences</h5>
                 <ul className="strategy-list">
                   <li><strong>Property Cost Base:</strong> Equal to elected amount</li>
                   <li><strong>UCC Addition:</strong> Elected amount for depreciable property</li>
                   <li><strong>Paid-Up Capital:</strong> Limited by PUC grinding rule (s.85(2.1))</li>
                   <li><strong>Share Basis:</strong> Corporation's cost = elected amount</li>
                 </ul>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">⚖️ Anti-Avoidance and Compliance</h4>
               
               <div className="legal-section">
                 <h5 className="legal-title">PUC Grinding (ITA s.85(2.1))</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Increase Calculation:</strong> Elected amount minus boot received</li>
                     <li><strong>Reduction Formula:</strong> Complex calculation involving multiple share classes</li>
                     <li><strong>Purpose:</strong> Prevent extraction of accrued gains as tax-free distributions</li>
                     <li><strong>Impact:</strong> Limits future dividend distributions without deemed disposition</li>
                   </ul>
                 </div>
               </div>

               <div className="legal-section">
                 <h5 className="legal-title">Election Requirements and Deadlines</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Form T2057:</strong> Joint election by transferor and corporation</li>
                     <li><strong>Filing Deadline:</strong> Latest of transferor and corporation filing due dates</li>
                     <li><strong>Late Filing Penalty:</strong> $100 per month up to $8,000 maximum</li>
                     <li><strong>Amendment Rules:</strong> Limited ability to amend elected amounts</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section">
               <h4 className="commentary-title">📈 Strategic Applications</h4>
               
               <div className="practice-points">
                 <div className="point-category">
                   <h6 className="point-title">Common Use Cases</h6>
                   <ul>
                     <li>Estate freezing and succession planning transactions</li>
                     <li>Business reorganizations and corporate restructuring</li>
                     <li>Income splitting through multiple share classes</li>
                     <li>Multiplication of capital gains exemption through family members</li>
                   </ul>
                 </div>

                 <div className="point-category">
                   <h6 className="point-title">Professional Considerations</h6>
                   <ul>
                     <li>Comprehensive valuation of transferred property</li>
                     <li>Detailed boot calculation and documentation</li>
                     <li>Corporate law compliance for share issuances</li>
                     <li>Integration with other tax provisions (TOSI, GAAR)</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         );

       case 'departureTax':
         return (
           <div className="commentary-content">
             <div className="commentary-section mb-5">
               <h4 className="commentary-title">📊 Departure Tax Overview</h4>
               <div className="row">
                 <div className="col-md-6">
                   <div className="rate-table federal-rates">
                     <h6 className="table-title">🎯 Deemed Disposition Rules</h6>
                     <ul className="rate-list">
                       <li><span className="rate">FMV</span> Deemed proceeds of disposition</li>
                       <li><span className="rate">Immediate</span> Day before departure</li>
                       <li><span className="rate">All</span> Property except exemptions</li>
                       <li><span className="rate highlight-rate">Actual</span> Capital gains triggered</li>
                     </ul>
                   </div>
                 </div>
                 <div className="col-md-6">
                   <div className="rate-table quebec-rates">
                     <h6 className="table-title">💰 Security Requirements</h6>
                     <ul className="rate-list">
                       <li><span className="rate">$25,000</span> Minimum security threshold</li>
                       <li><span className="rate">116(5.02)</span> Emigration clearance</li>
                       <li><span className="rate highlight-rate">Acceptable</span> Various security forms</li>
                       <li><span className="rate">Interest</span> Accrues on unpaid amounts</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-5">
               <h4 className="commentary-title">🏛️ Property Subject to Departure Tax</h4>
               <div className="legal-section">
                 <h5 className="legal-title">Taxable Canadian Property (TCP)</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Real Estate:</strong> Canadian real property and interests therein</li>
                     <li><strong>Business Property:</strong> Property used in Canadian business</li>
                     <li><strong>Shares:</strong> Non-public corporations resident in Canada (&gt;50% value from Canadian real estate)</li>
                     <li><strong>Resource Property:</strong> Canadian resource and timber resource properties</li>
                   </ul>
                 </div>
               </div>
               
               <div className="legal-section">
                 <h5 className="legal-title">Exempt Property</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Personal-Use Property:</strong> Principal residence, household effects under $10,000</li>
                     <li><strong>Business Inventory:</strong> Property held for sale in ordinary course</li>
                     <li><strong>Cash and Deposits:</strong> Currency, bank deposits, and guaranteed investment certificates</li>
                     <li><strong>Rights to Receive:</strong> Employment income, pension benefits, certain annuities</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">💼 Deferral Mechanisms</h4>
               
               <div className="strategy-section">
                 <h5 className="strategy-title">Security Posting (ITA s.220(4.5))</h5>
                 <div className="comparison-table">
                   <div className="comparison-item">
                     <strong>Acceptable Security:</strong>
                     <ul>
                       <li>Cash deposit with CRA</li>
                       <li>Certified cheque from chartered bank</li>
                       <li>Bank guarantee or letter of credit</li>
                       <li>Bonds or marketable securities</li>
                     </ul>
                   </div>
                   <div className="comparison-item">
                     <strong>Deferral Benefits:</strong>
                     <ul>
                       <li>Defer payment until actual disposition</li>
                       <li>Potential for lower tax if property declines</li>
                       <li>Maintains liquidity for emigration</li>
                       <li>Protection against currency fluctuations</li>
                     </ul>
                   </div>
                 </div>
               </div>

               <div className="strategy-section">
                 <h5 className="strategy-title">Unwinding Elections</h5>
                 <ul className="strategy-list">
                   <li><strong>Return to Canada:</strong> Unwind deemed disposition if return within specific period</li>
                   <li><strong>Election Requirements:</strong> File within prescribed deadlines and conditions</li>
                   <li><strong>Property Identification:</strong> Must be same property subject to original departure tax</li>
                   <li><strong>Tax Adjustments:</strong> Refund of departure tax paid, subject to limitations</li>
                 </ul>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">⚖️ Treaty Considerations</h4>
               
               <div className="legal-section">
                 <h5 className="legal-title">Tax Treaty Relief</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Source Rules:</strong> Treaty may limit Canada's taxing rights on departure</li>
                     <li><strong>Tie-Breaker Rules:</strong> Residency determination under treaty provisions</li>
                     <li><strong>Specific Exemptions:</strong> Some treaties provide departure tax relief</li>
                     <li><strong>Competent Authority:</strong> Relief through mutual agreement procedures</li>
                   </ul>
                 </div>
               </div>

               <div className="legal-section">
                 <h5 className="legal-title">US Treaty Specific Rules</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Savings Clause:</strong> Limited protection for US citizens emigrating</li>
                     <li><strong>Exchange of Information:</strong> Automatic reporting to IRS under Article XXVII</li>
                     <li><strong>Covered Expatriates:</strong> Coordination with US exit tax rules</li>
                     <li><strong>Pre-Immigration Gains:</strong> Step-up for property owned before Canadian residence</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section">
               <h4 className="commentary-title">📈 Compliance and Planning</h4>
               
               <div className="practice-points">
                 <div className="point-category">
                   <h6 className="point-title">Pre-Departure Planning</h6>
                   <ul>
                     <li>Comprehensive asset inventory and valuation</li>
                     <li>Strategic realization of losses to offset gains</li>
                     <li>Consideration of in-specie distributions from corporations</li>
                     <li>Evaluation of trust structures for tax deferral</li>
                   </ul>
                 </div>

                 <div className="point-category">
                   <h6 className="point-title">Filing Obligations</h6>
                   <ul>
                     <li>Final Canadian tax return by April 30 following departure year</li>
                     <li>Form T1161: List of properties by emigrant</li>
                     <li>Security arrangements with CRA if deferral elected</li>
                     <li>Ongoing reporting requirements for TCP dispositions</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         );

       case 'windup88':
         return (
           <div className="commentary-content">
             <div className="commentary-section mb-5">
               <h4 className="commentary-title">📊 Section 88 Winding-Up Framework</h4>
               <div className="row">
                 <div className="col-md-6">
                   <div className="rate-table federal-rates">
                     <h6 className="table-title">🎯 Qualifying Conditions</h6>
                     <ul className="rate-list">
                       <li><span className="rate">≥90%</span> Parent ownership requirement</li>
                       <li><span className="rate">Resident</span> Both corporations in Canada</li>
                       <li><span className="rate">Complete</span> Full dissolution required</li>
                       <li><span className="rate highlight-rate">Tax-free</span> Rollover treatment available</li>
                     </ul>
                   </div>
                 </div>
                 <div className="col-md-6">
                   <div className="rate-table quebec-rates">
                     <h6 className="table-title">💰 Tax Consequences</h6>
                     <ul className="rate-list">
                       <li><span className="rate">Bump</span> Cost base increase to FMV</li>
                       <li><span className="rate">Flow-through</span> Tax attributes transfer</li>
                       <li><span className="rate highlight-rate">Rollover</span> Subsidiary deemed disposition</li>
                       <li><span className="rate">Timing</span> Distribution on wind-up</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-5">
               <h4 className="commentary-title">🏛️ Qualification Requirements</h4>
               <div className="legal-section">
                 <h5 className="legal-title">Ownership Tests (ITA s.88(1))</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Share Ownership:</strong> Parent must own ≥90% of issued shares of each class</li>
                     <li><strong>Value Test:</strong> ≥90% by fair market value of all shares</li>
                     <li><strong>Voting Control:</strong> ≥90% of voting rights in subsidiary</li>
                     <li><strong>Timing:</strong> Ownership requirements must be met throughout winding-up</li>
                   </ul>
                 </div>
               </div>
               
               <div className="legal-section">
                 <h5 className="legal-title">Distribution Requirements</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Complete Dissolution:</strong> Subsidiary must be completely wound up</li>
                     <li><strong>Distribution to Parent:</strong> Property distributed only to qualifying parent</li>
                     <li><strong>Corporate Law Compliance:</strong> Winding-up under applicable corporate legislation</li>
                     <li><strong>Final Distribution:</strong> All property must be distributed before dissolution</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">💼 Tax Consequences and Flow-Through</h4>
               
               <div className="strategy-section">
                 <h5 className="strategy-title">Parent Corporation Effects</h5>
                 <div className="comparison-table">
                   <div className="comparison-item">
                     <strong>Share Disposition:</strong>
                     <ul>
                       <li>Deemed disposition at cost (no gain/loss)</li>
                       <li>Proceeds equal to adjusted cost base</li>
                       <li>No capital gain or loss recognition</li>
                     </ul>
                   </div>
                   <div className="comparison-item">
                     <strong>Property Receipt:</strong>
                     <ul>
                       <li>Property acquired at "bumped" cost base</li>
                       <li>Cost base = FMV at time of distribution</li>
                       <li>Potential for significant cost base increase</li>
                     </ul>
                   </div>
                 </div>
               </div>

               <div className="strategy-section">
                 <h5 className="strategy-title">Tax Attribute Flow-Through</h5>
                 <ul className="strategy-list">
                   <li><strong>Loss Carryforwards:</strong> Non-capital and capital losses transfer to parent</li>
                   <li><strong>Investment Tax Credits:</strong> Unused ITCs flow through with restrictions</li>
                   <li><strong>RDTOH Balances:</strong> Refundable dividend tax on hand transfers</li>
                   <li><strong>Resource Pools:</strong> Canadian exploration and development expenses</li>
                 </ul>
               </div>
             </div>

             <div className="commentary-section mb-4">
               <h4 className="commentary-title">⚖️ Limitations and Anti-Avoidance</h4>
               
               <div className="legal-section">
                 <h5 className="legal-title">Cost Bump Limitations (ITA s.88(1)(d))</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Non-Depreciable Capital Property:</strong> Full cost bump to fair market value</li>
                     <li><strong>Depreciable Property:</strong> Limited by undepreciated capital cost</li>
                     <li><strong>Inventory and Non-Capital Property:</strong> No cost bump available</li>
                     <li><strong>Ineligible Property:</strong> Property not used in active business</li>
                   </ul>
                 </div>
               </div>

               <div className="legal-section">
                 <h5 className="legal-title">Loss Utilization Restrictions</h5>
                 <div className="legal-content">
                   <ul className="legal-list">
                     <li><strong>Acquisition of Control:</strong> Streaming rules may apply to limit losses</li>
                     <li><strong>Business Continuity:</strong> Subsidiary business must continue with reasonable continuity</li>
                     <li><strong>Related Business Test:</strong> Losses only available against income from same/similar business</li>
                     <li><strong>GAAR Considerations:</strong> Artificial loss multiplication strategies at risk</li>
                   </ul>
                 </div>
               </div>
             </div>

             <div className="commentary-section">
               <h4 className="commentary-title">📈 Strategic Applications</h4>
               
               <div className="practice-points">
                 <div className="point-category">
                   <h6 className="point-title">Common Scenarios</h6>
                   <ul>
                     <li>Corporate group simplification and consolidation</li>
                     <li>Realization of cost base bumps for appreciated property</li>
                     <li>Utilization of subsidiary tax losses and credits</li>
                     <li>Estate planning and succession arrangements</li>
                   </ul>
                 </div>

                 <div className="point-category">
                   <h6 className="point-title">Professional Considerations</h6>
                   <ul>
                     <li>Comprehensive property valuations for cost bump calculations</li>
                     <li>Analysis of tax attribute carryforward values and restrictions</li>
                     <li>Corporate law compliance and dissolution procedures</li>
                     <li>Integration with broader corporate reorganization strategies</li>
                   </ul>
                 </div>
               </div>
             </div>
           </div>
         );

       default:
         return <p className="text-justify">{calculator.details.commentary}</p>;
     }
   };

   const getModalContent = () => {
     if (!showModal.type || !showModal.calculatorKey) return null;
     
     const calculator = calculators.find(c => c.id === showModal.calculatorKey);
     if (!calculator) return null;

    switch (showModal.type) {
      case 'ita':
        return (
          <div>
            <h6 className="text-cookie-brown mb-3">Income Tax Act Sections</h6>
            {calculator.details.ita.map((item, index) => (
              <div key={index} className="mb-3 p-3 bg-cookie-cream rounded">
                <strong className="text-cookie-orange">{item.section}</strong>
                <p className="mb-0 mt-1">{item.description}</p>
                                 <small className="text-muted">
                   <a href={`https://laws-lois.justice.gc.ca/eng/acts/i-3.3/section-${item.section.match(/\d+/)?.[0] || '1'}.html`} 
                      target="_blank" rel="noopener noreferrer" className="text-cookie-brown">
                     View on canada.ca <i className="bi bi-box-arrow-up-right"></i>
                   </a>
                 </small>
              </div>
            ))}
          </div>
        );
      
             case 'forms':
         return (
           <div>
             <h6 className="text-cookie-brown mb-3">CRA Forms</h6>
             {calculator.details.forms.map((item, index) => (
               <div key={index} className="mb-3 p-3 bg-cookie-cream rounded">
                 <strong className="text-cookie-orange">{item.form}</strong>
                 <p className="mb-0 mt-1">{item.description}</p>
               </div>
             ))}
             <hr className="my-3" />
             <div className="text-center">
               <a href="https://www.canada.ca/en/revenue-agency/services/forms-publications/forms.html" 
                  target="_blank" rel="noopener noreferrer" className="btn btn-cookie-unified me-3">
                 <i className="bi bi-download me-2"></i>All CRA Forms
               </a>
               {calculator.details.forms.some(f => f.form.includes('T1') || f.form.includes('TP-')) && (
                 <a href="https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/" 
                    target="_blank" rel="noopener noreferrer" className="btn btn-cookie-unified">
                   <i className="bi bi-download me-2"></i>Quebec Forms
                 </a>
               )}
             </div>
           </div>
         );
      
      case 'folios':
        return (
          <div>
            <h6 className="text-cookie-brown mb-3">Income Tax Folios</h6>
            {calculator.details.folios.map((item, index) => (
              <div key={index} className="mb-3 p-3 bg-cookie-cream rounded">
                <strong className="text-cookie-orange">IT Folio {item.folio}</strong>
                <p className="mb-0 mt-1">{item.description}</p>
                                 <small className="text-muted">
                   {(() => {
                     const getFolioUrl = (folioCode: string) => {
                       // Map specific folios to their actual URLs
                       const folioUrls: { [key: string]: string } = {
                         'S1-F2-C3': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-1-individuals/folio-2-students/income-tax-folio-s1-f2-c3-scholarships-research-grants-other-education-assistance.html',
                         'S1-F3-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-1-individuals/folio-3-family-unit-issues/income-tax-folio-s1-f3-c1-child-care-expense-deduction.html',
                         'S1-F3-C2': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-1-individuals/folio-3-family-unit-issues/income-tax-folio-s1-f3-c2-principal-residence.html',
                         'S4-F15-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-15-manufacturing-processing/income-tax-folio-s4-f15-c1-manufacturing-processing.html',
                         'S4-F2-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-2-deductibility-business-expenses/income-tax-folio-s4-f2-c1-deductibility-fines-penalties.html',
                         'S3-F6-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-3-property-investments-savings-plans/folio-6-interests-debts-expenses/income-tax-folio-s3-f6-c1-interest-deductibility.html',
                         'S4-F3-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-3-other-business-issues/income-tax-folio-s4-f3-c1-price-adjustment-clauses.html',
                         'S4-F8-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-8-share-transactions/income-tax-folio-s4-f8-c1-business-investment-losses.html',
                         'S3-F9-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-3-property-investments-savings-plans/folio-9-miscellaneous-payments-receipts/income-tax-folio-s3-f9-c1-lottery-winnings-miscellaneous-receipts-income-losses-crime.html',
                         'S4-F7-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-4-businesses/folio-7-share-transactions/income-tax-folio-s4-f7-c1-amalgamations-canadian-corporations.html',
                         'S5-F1-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-5-international-taxation/folio-1-residency/income-tax-folio-s5-f1-c1-determining-individuals-residence-status.html',
                         'S5-F2-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-5-international-taxation/folio-2-foreign-tax-credits-deductions/income-tax-folio-s5-f2-c1-foreign-tax-credit.html',
                         'S2-F1-C1': 'https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-2-family-trust-units/folio-1-family-trust-units/income-tax-folio-s2-f1-c1-education-textbook-tax-credits.html'
                       };
                       return folioUrls[folioCode] || `https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index.html`;
                     };
                     
                     return (
                       <a href={getFolioUrl(item.folio)} 
                          target="_blank" rel="noopener noreferrer" className="text-cookie-brown">
                         View Folio <i className="bi bi-box-arrow-up-right"></i>
                       </a>
                     );
                   })()}
                 </small>
              </div>
            ))}
          </div>
        );
      
             case 'commentary':
         return (
           <div>
             <h6 className="text-cookie-brown mb-3">Professional Commentary</h6>
             <div className="p-4 bg-cookie-cream rounded">
               {getEnhancedCommentary(calculator)}
               <hr className="my-3" />
               <small className="text-muted">
                 <strong>Additional Resources:</strong><br />
                 <a href="https://www.canlii.org" target="_blank" rel="noopener noreferrer" className="text-cookie-brown me-3">
                   Case Law - CanLII <i className="bi bi-box-arrow-up-right"></i>
                 </a>
                 <a href="https://www.canada.ca/en/revenue-agency.html" target="_blank" rel="noopener noreferrer" className="text-cookie-brown">
                   Official Guidance - CRA <i className="bi bi-box-arrow-up-right"></i>
                 </a>
               </small>
             </div>
           </div>
         );
      
      default:
        return null;
    }
  };

  return (
    <>
      <div className="row g-4">
        {calculators.map((calc) => (
          <div key={calc.id} className="col-lg-4 col-md-6">
            <div className="card tax-card h-100">
                                            <div className="card-header d-flex justify-content-between align-items-center py-3">
                 <div className="d-flex align-items-center">
                   <h6 className="card-title mb-0 text-cookie-brown fw-bold">{calc.name}</h6>
                 </div>
               </div>
               
               <div className="card-body">
                 <p className="text-muted small mb-3">{calc.description}</p>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <button 
                      className="btn btn-cookie-unified btn-sm w-100"
                      onClick={() => handleDetailModal('ita', calc.id)}
                    >
                      <i className="bi bi-book me-1"></i>ITA ({calc.details.ita.length})
                    </button>
                  </div>
                  <div className="col-6">
                <button
                      className="btn btn-cookie-unified btn-sm w-100"
                      onClick={() => handleDetailModal('forms', calc.id)}
                    >
                      <i className="bi bi-file-earmark me-1"></i>Forms ({calc.details.forms.length})
                </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className="btn btn-cookie-unified btn-sm w-100"
                      onClick={() => handleDetailModal('folios', calc.id)}
                    >
                      <i className="bi bi-journal me-1"></i>Folios ({calc.details.folios.length})
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className="btn btn-cookie-unified btn-sm w-100"
                      onClick={() => handleDetailModal('commentary', calc.id)}
                    >
                      <i className="bi bi-chat-quote me-1"></i>Commentary
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong className="text-cookie-brown">Notes:</strong>
                    {editingNotes !== calc.id && (
                      <button 
                        className="btn btn-cookie-unified btn-sm"
                        onClick={() => handleNotesEdit(calc.id)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                    )}
                  </div>
                  
                  {editingNotes === calc.id ? (
                    <div>
                      <textarea 
                        className="form-control mb-2" 
                        rows={3}
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Add your notes here..."
                      />
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-cookie-unified btn-sm"
                          onClick={() => handleNotesSave(calc.id)}
                        >
                          <i className="bi bi-check me-1"></i>Save
                        </button>
                        <button 
                          className="btn btn-cookie-secondary btn-sm"
                          onClick={handleNotesCancel}
                        >
                          <i className="bi bi-x me-1"></i>Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-cookie-light-yellow rounded">
                      {calculatorNotes[calc.id] || (
                        <em className="text-muted">Click edit to add notes...</em>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-footer">
                <button 
                  className="btn btn-cookie-secondary w-100"
                  onClick={() => {
                    if (onCalculatorSelect) {
                      onCalculatorSelect(calc.id as CalculatorType);
                    } else {
                      setActiveCalculator(calc.id as CalculatorType);
                    }
                  }}
                >
                  <i className="bi bi-play-circle me-2"></i>Use This Calculator
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>

      {/* Detail Modal */}
      {showModal.type && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {calculators.find(c => c.id === showModal.calculatorKey)?.name} - {' '}
                  {showModal.type === 'ita' && 'ITA Sections'}
                  {showModal.type === 'forms' && 'CRA Forms'}
                  {showModal.type === 'folios' && 'Income Tax Folios'}
                  {showModal.type === 'commentary' && 'Professional Commentary'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal({ type: null, calculatorKey: null })}
                ></button>
              </div>
              <div className="modal-body">
                {getModalContent()}
              </div>
              <div className="modal-footer">
                <button
                  type="button" 
                  className="btn btn-cookie-secondary" 
                  onClick={() => setShowModal({ type: null, calculatorKey: null })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
    </div>
      )}
    </>
  );
};

export default CalculatorSummary; 