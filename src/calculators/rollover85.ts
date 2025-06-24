interface Rollover85Input {
  selectedAssets: number;
  electedAmount: number;
  fmv: number; // Fair Market Value
  acb: number; // Adjusted Cost Base
  boot: number; // Non-share consideration received
}

interface Rollover85Output {
  minElectedAmount: number;
  maxElectedAmount: number;
  cdaBump: number;
  puc: number; // Paid-up Capital
  grip: number; // General Rate Income Pool
}

export function calcRollover85({
  electedAmount,
  fmv,
  acb,
  boot
}: Rollover85Input): Rollover85Output {
  // Calculate min/max elected amounts
  const minElectedAmount = Math.max(boot, acb);
  const maxElectedAmount = Math.max(boot, fmv);
  
  // Validate elected amount is within range
  const validElectedAmount = Math.max(minElectedAmount, Math.min(maxElectedAmount, electedAmount));
  
  // Calculate capital gain/loss
  const capitalGain = Math.max(0, validElectedAmount - acb);
  
  // CDA bump (non-taxable portion of capital gain)
  const cdaBump = capitalGain * 0.5;
  
  // PUC calculation
  const puc = Math.max(0, validElectedAmount - boot);
  
  // GRIP addition (38% of taxable capital gain)
  const grip = (capitalGain * 0.5) * 0.38;
  
  return {
    minElectedAmount: Math.round(minElectedAmount * 100) / 100,
    maxElectedAmount: Math.round(maxElectedAmount * 100) / 100,
    cdaBump: Math.round(cdaBump * 100) / 100,
    puc: Math.round(puc * 100) / 100,
    grip: Math.round(grip * 100) / 100
  };
} 