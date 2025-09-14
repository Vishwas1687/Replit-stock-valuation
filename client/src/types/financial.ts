export interface CompanyData {
  id: string;
  symbol: string;
  companyName: string;
  price: number;
  pe: number;
  pyEps: number;
  
  // Current Year Fields
  cyEpsLow?: number | null;
  cyEpsAvg: number;
  cyEpsHigh?: number | null;
  cyEpsChangePercentLow?: number | null;
  cyEpsChangePercentAvg: number;
  cyEpsChangePercentHigh?: number | null;
  cyPeLow?: number | null;
  cyPeAvg: number;
  cyPeHigh?: number | null;
  cyPegLow?: number | null;
  cyPegAvg: number;
  cyPegHigh?: number | null;
  
  // Next Year Fields
  nyEpsLow?: number | null;
  nyEpsAvg: number;
  nyEpsHigh?: number | null;
  nyEpsChangePercentLow?: number | null;
  nyEpsChangePercentAvg: number;
  nyEpsChangePercentHigh?: number | null;
  nyPeLow?: number | null;
  nyPeAvg: number;
  nyPeHigh?: number | null;
  nyPegLow?: number | null;
  nyPegAvg: number;
  nyPegHigh?: number | null;
  
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface FieldVisibility {
  showLowHigh: boolean;
}

export interface CalculatedMetrics {
  intrinsicValue?: number;
  marginOfSafety?: number;
  growthRate?: number;
}

export interface UserPreferences {
  id: string;
  userId: string;
  showLowHigh: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface StockValidationResult {
  valid: boolean;
  companyName?: string;
  symbol?: string;
  price?: number;
  message?: string;
}
