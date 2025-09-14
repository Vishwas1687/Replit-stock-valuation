import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StockValidationResult } from "@/types/financial";

interface CompanyFormProps {
  onRefreshAll: () => void;
  isRefreshing: boolean;
}

export default function CompanyForm({ onRefreshAll, isRefreshing }: CompanyFormProps) {
  const [symbol, setSymbol] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCompanyMutation = useMutation({
    mutationFn: async (symbol: string) => {
      const res = await apiRequest("POST", "/api/companies/add-symbol", { symbol });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setSymbol("");
      toast({
        title: "Success",
        description: "Company added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateSymbol = async (symbolToValidate: string) => {
    if (!symbolToValidate.trim()) return;
    
    setIsValidating(true);
    try {
      const res = await apiRequest("POST", "/api/validate-symbol", { symbol: symbolToValidate });
      const result: StockValidationResult = await res.json();
      
      if (result.valid) {
        toast({
          title: "Valid Symbol",
          description: `${result.companyName} - $${result.price?.toFixed(2)}`,
        });
      } else {
        toast({
          title: "Invalid Symbol",
          description: result.message || "Symbol not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate symbol",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      addCompanyMutation.mutate(symbol.trim().toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Company Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add new companies or manage existing ones in your watchlist
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-md">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  className="pr-10"
                  data-testid="input-stock-symbol"
                />
                <button
                  type="button"
                  onClick={() => validateSymbol(symbol)}
                  disabled={isValidating || !symbol.trim()}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  data-testid="button-validate-symbol"
                >
                  {isValidating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Button
                type="submit"
                disabled={addCompanyMutation.isPending || !symbol.trim()}
                data-testid="button-add-company"
              >
                {addCompanyMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Company
              </Button>
            </form>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onRefreshAll}
              disabled={isRefreshing}
              data-testid="button-refresh-all"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh All Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
