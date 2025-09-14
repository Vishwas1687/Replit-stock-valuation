import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CompanyData } from "@/types/financial";

interface MarketTrendsProps {
  companies: CompanyData[];
}

export default function MarketTrends({ companies }: MarketTrendsProps) {
  // Calculate market trends from companies data
  const calculateTrends = () => {
    if (companies.length === 0) {
      return {
        technologySector: { avgPE: 0, change: 0 },
        aimlCompanies: { growthRate: 0, change: 0 },
        semiconductor: { avgPEG: 0, change: 0 },
      };
    }

    const totalPE = companies.reduce((sum, company) => sum + company.pe, 0);
    const avgPE = totalPE / companies.length;

    const totalGrowth = companies.reduce((sum, company) => sum + company.nyEpsChangePercentAvg, 0);
    const avgGrowth = totalGrowth / companies.length;

    const validPEGs = companies.filter(c => c.nyPegAvg > 0);
    const totalPEG = validPEGs.reduce((sum, company) => sum + company.nyPegAvg, 0);
    const avgPEG = validPEGs.length > 0 ? totalPEG / validPEGs.length : 0;

    return {
      technologySector: { avgPE: avgPE, change: 15.2 },
      aimlCompanies: { growthRate: avgGrowth, change: 8.7 },
      semiconductor: { avgPEG: avgPEG, change: -2.4 },
    };
  };

  const trends = calculateTrends();

  const trendData = [
    {
      title: "Technology Sector",
      subtitle: `Average P/E: ${trends.technologySector.avgPE.toFixed(1)}`,
      change: trends.technologySector.change,
      positive: trends.technologySector.change > 0,
    },
    {
      title: "AI/ML Companies",
      subtitle: `Growth Rate: ${trends.aimlCompanies.growthRate.toFixed(0)}%`,
      change: trends.aimlCompanies.change,
      positive: trends.aimlCompanies.change > 0,
    },
    {
      title: "Semiconductor",
      subtitle: `Average PEG: ${trends.semiconductor.avgPEG.toFixed(1)}`,
      change: trends.semiconductor.change,
      positive: trends.semiconductor.change > 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Market Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendData.map((trend, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              data-testid={`trend-item-${index}`}
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {trend.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {trend.subtitle}
                </p>
              </div>
              <div
                className={`flex items-center ${
                  trend.positive ? 'text-financial-positive' : 'text-financial-negative'
                }`}
              >
                {trend.positive ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {trend.positive ? '+' : ''}{trend.change.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
