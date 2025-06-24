import { describe, it, expect } from 'vitest';
import { calcIndTax } from '@/calculators/indTax';

describe('calcIndTax', () => {
  it('should calculate zero tax for zero income', () => {
    const result = calcIndTax({
      salary: 0,
      eligibleDiv: 0,
      otherIncome: 0,
    });
    
    expect(result.netTax).toBe(0);
  });

  it('should calculate tax for salary income only', () => {
    const result = calcIndTax({
      salary: 50000,
      eligibleDiv: 0,
      otherIncome: 0,
    });
    
    // Federal: 50000 * 0.15 = 7500
    // Quebec: 50000 * 0.14 = 7000
    // Total: 14500
    expect(result.netTax).toBe(14500);
  });

  it('should calculate tax for mixed income sources', () => {
    const result = calcIndTax({
      salary: 60000,
      eligibleDiv: 10000,
      otherIncome: 5000,
    });
    
    // Total income: 75000
    // Federal: 55867 * 0.15 + 19133 * 0.205 = 8380.05 + 3922.27 = 12302.32
    // Quebec: 51780 * 0.14 + 23220 * 0.19 = 7249.2 + 4411.8 = 11661
    // Total: 23963.32
    expect(result.netTax).toBe(23963.32);
  });

  it('should handle higher income brackets', () => {
    const result = calcIndTax({
      salary: 200000,
      eligibleDiv: 0,
      otherIncome: 0,
    });
    
    // Should use multiple tax brackets
    expect(result.netTax).toBeGreaterThan(50000);
    expect(typeof result.netTax).toBe('number');
  });
}); 