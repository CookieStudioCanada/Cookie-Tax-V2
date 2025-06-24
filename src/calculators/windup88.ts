interface Windup88Input {
  puc: number; // Paid-up Capital
  grip: number; // General Rate Income Pool
  cda: number; // Capital Dividend Account
  nerdtoh: number; // Non-eligible RDTOH
  rdtoh: number; // Eligible RDTOH
}

interface Windup88Output {
  taxFreeDividendBuckets: number;
  integrationResult: number;
}

export function calcWindup88({
  puc,
  grip,
  cda,
  nerdtoh,
  rdtoh
}: Windup88Input): Windup88Output {
  // Calculate tax-free dividend capacity
  const cdaDividend = cda;
  const pucReduction = puc;
  const taxFreeDividendBuckets = cdaDividend + pucReduction;
  
  // Calculate integration result (simplified)
  const gripDividend = grip;
  const rdtohRefund = Math.min(rdtoh, gripDividend * 0.3846); // 38.46% refund rate
  const nerdtohRefund = Math.min(nerdtoh, gripDividend * 0.3846);
  
  const integrationResult = gripDividend - rdtohRefund - nerdtohRefund;
  
  return {
    taxFreeDividendBuckets: Math.round(taxFreeDividendBuckets * 100) / 100,
    integrationResult: Math.round(integrationResult * 100) / 100
  };
} 