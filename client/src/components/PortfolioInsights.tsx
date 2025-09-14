import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { CompanyData } from "@/types/financial";

interface PortfolioInsightsProps {
  companies: CompanyData[];
}

export default function PortfolioInsights({ companies }: PortfolioInsightsProps) {
  const generateInsights = () => {
    if (companies.length === 0) {
      return [
        {
          type: "info",
          title: "Get Started",
          message: "Add companies to your watchlist to see portfolio insights",
          icon: Lightbulb,
          color: "text-primary",
          bgColor: "bg-primary/5",
          borderColor: "border-primary/20",
        },
      ];
    }

    const insights = [];

    // Find best growth opportunity
    const bestGrowth = companies.reduce((best, current) => {
      const currentGrowth = current.nyEpsChangePercentAvg || 0;
      const bestGrowthRate = best.nyEpsChangePercentAvg || 0;
      return currentGrowth > bestGrowthRate ? current : best;
    }, companies[0]);

    insights.push({
      type: "growth",
      title: "Growth Opportunity",
      message: `${bestGrowth.symbol} shows strong future EPS growth potential with ${((bestGrowth.nyEpsChangePercentAvg || 0)).toFixed(0)}% projected increase`,
      icon: Lightbulb,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
    });

    // Find highest P/E ratio for valuation alert
    const highestPE = companies.reduce((highest, current) => {
      const currentPE = current.pe || 0;
      const highestPEValue = highest.pe || 0;
      return currentPE > highestPEValue ? current : highest;
    }, companies[0]);

    if ((highestPE.pe || 0) > 100) {
      insights.push({
        type: "warning",
        title: "Valuation Alert",
        message: `${highestPE.symbol} trading at high P/E ratio of ${((highestPE.pe || 0)).toFixed(0)}, monitor for value correction`,
        icon: AlertTriangle,
        color: "text-yellow-800",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      });
    }

    // Balanced portfolio message
    insights.push({
      type: "success",
      title: "Portfolio Analysis",
      message: `Good diversification across ${companies.length} companies with mixed growth and value characteristics`,
      icon: CheckCircle,
      color: "text-green-800",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    });

    return insights;
  };

  const insights = generateInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Portfolio Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${insight.bgColor} ${insight.borderColor}`}
                data-testid={`insight-${insight.type}-${index}`}
              >
                <div className="flex items-start">
                  <Icon className={`${insight.color} mt-1 mr-3`} size={16} />
                  <div>
                    <p className={`text-sm font-medium ${insight.color}`}>
                      {insight.title}
                    </p>
                    <p className={`text-xs ${insight.color} mt-1 opacity-80`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
