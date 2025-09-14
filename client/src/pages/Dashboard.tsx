import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChartLine, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCards from "@/components/StatsCards";
import CompanyForm from "@/components/CompanyForm";
import CompanyTable from "@/components/CompanyTable";
import MarketTrends from "@/components/MarketTrends";
import PortfolioInsights from "@/components/PortfolioInsights";
import { CompanyData, FieldVisibility } from "@/types/financial";
import { useFieldVisibility } from "@/hooks/useLocalStorage";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [fieldVisibility, setFieldVisibility] = useFieldVisibility();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companies
  const { data: companies = [], isLoading, error } = useQuery<CompanyData[]>({
    queryKey: ["/api/companies"],
  });

  // Refresh all companies mutation
  const refreshAllMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/companies/refresh-all");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "All company data refreshed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to refresh data: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFieldVisibilityChange = (visibility: FieldVisibility) => {
    setFieldVisibility(visibility);
  };

  const handleRefreshAll = () => {
    refreshAllMutation.mutate();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Error Loading Dashboard
          </h1>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ChartLine className="text-primary text-2xl" size={28} />
                <h1 className="text-xl font-bold text-primary">StockSync Kit</h1>
              </div>
              <span className="text-sm text-muted-foreground">
                Financial Analysis Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards companies={companies} />

        {/* Company Form */}
        <CompanyForm 
          onRefreshAll={handleRefreshAll}
          isRefreshing={refreshAllMutation.isPending}
        />

        {/* Company Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading companies...</p>
            </div>
          </div>
        ) : (
          <CompanyTable
            companies={companies}
            fieldVisibility={fieldVisibility}
            onFieldVisibilityChange={handleFieldVisibilityChange}
          />
        )}

        {/* Analytics Section */}
        {companies.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MarketTrends companies={companies} />
            <PortfolioInsights companies={companies} />
          </div>
        )}
      </main>
    </div>
  );
}
