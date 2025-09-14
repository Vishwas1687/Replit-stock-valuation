import { Card, CardContent } from "@/components/ui/card";
import { Building, BarChart3, Trophy, Clock } from "lucide-react";
import { CompanyData } from "@/types/financial";
import { calculateStockMetrics } from "@/utils/calculations";

interface StatsCardsProps {
  companies: CompanyData[];
}

export default function StatsCards({ companies }: StatsCardsProps) {
  const metrics = calculateStockMetrics(companies);

  const stats = [
    {
      title: "Total Companies",
      value: metrics.totalCompanies.toString(),
      icon: Building,
      color: "text-primary",
    },
    {
      title: "Average P/E Ratio",
      value: isFinite(metrics.averagePE) ? metrics.averagePE.toFixed(1) : '0.0',
      icon: BarChart3,
      color: "text-primary",
    },
    {
      title: "Best Performer",
      value: metrics.topPerformer || 'N/A',
      icon: Trophy,
      color: "text-financial-positive",
    },
    {
      title: "Last Updated",
      value: metrics.lastUpdated,
      icon: Clock,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} data-testid={`stat-card-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p 
                    className={`text-2xl font-bold ${stat.color}`}
                    data-testid={`stat-value-${index}`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div className="ml-4">
                  <Icon className={`${stat.color} text-xl`} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
