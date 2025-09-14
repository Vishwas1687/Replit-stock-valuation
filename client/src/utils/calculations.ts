import { CompanyData } from "@/types/financial";

export const calculateFinancialMetrics = (company: CompanyData) => {
  // Calculate PE ratio from Price and EPS if not provided
  const calculatedPE = company.price / company.cyEpsAvg;

  // Calculate PEG ratios
  const cyPegFromGrowth = company.cyEpsChangePercentAvg > 0
    ? company.cyPeAvg / company.cyEpsChangePercentAvg
    : undefined;

  const nyPegFromGrowth = company.nyEpsChangePercentAvg > 0
    ? company.nyPeAvg / company.nyEpsChangePercentAvg
    : undefined;

  // Calculate growth rate
  const epsGrowthRate = ((company.nyEpsAvg - company.cyEpsAvg) / company.cyEpsAvg) * 100;

  // Calculate fair value using PEG ratio
  const fairValuePE = company.nyEpsAvg * 15; // Assuming fair PE of 15
  const currentValuation = company.price / company.nyEpsAvg;

  // Calculate margin of safety
  const marginOfSafety = ((fairValuePE - company.price) / fairValuePE) * 100;

  return {
    calculatedPE,
    cyPegFromGrowth,
    nyPegFromGrowth,
    epsGrowthRate,
    fairValuePE,
    currentValuation,
    marginOfSafety,
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }
  return value.toFixed(decimals);
};

export const getFinancialColor = (value: number, isPercentage: boolean = false): string => {
  if (isPercentage) {
    return value > 0 ? 'text-financial-positive' : 'text-financial-negative';
  }
  return 'text-foreground';
};

export const calculateStockMetrics = (companies: CompanyData[]) => {
  if (companies.length === 0) {
    return {
      totalCompanies: 0,
      averagePE: 0,
      topPerformer: '',
      lastUpdated: 'Never',
    };
  }

  const totalPE = companies.reduce((sum, company) => sum + company.pe, 0);
  const averagePE = totalPE / companies.length;

  // Find top performer based on next year EPS growth
  const topPerformer = companies.reduce((best, current) => {
    return current.nyEpsChangePercentAvg > best.nyEpsChangePercentAvg ? current : best;
  }, companies[0]);

  return {
    totalCompanies: companies.length,
    averagePE,
    topPerformer: topPerformer.symbol,
    lastUpdated: 'Now',
  };
};
