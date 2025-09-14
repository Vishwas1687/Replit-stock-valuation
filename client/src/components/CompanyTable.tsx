import { useState } from "react";
import { CompanyData, FieldVisibility } from "@/types/financial";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  getFinancialColor,
} from "@/utils/calculations";

interface CompanyTableProps {
  companies: CompanyData[];
  fieldVisibility: FieldVisibility;
  onFieldVisibilityChange: (visibility: FieldVisibility) => void;
}

export default function CompanyTable({ 
  companies, 
  fieldVisibility, 
  onFieldVisibilityChange 
}: CompanyTableProps) {
  const [editingCompany, setEditingCompany] = useState<CompanyData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/companies/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company deleted successfully",
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

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyData> }) => {
      const res = await apiRequest("PUT", `/api/companies/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setIsEditDialogOpen(false);
      setEditingCompany(null);
      toast({
        title: "Success",
        description: "Company updated successfully",
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

  const refreshCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/companies/${id}/refresh`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company data refreshed successfully",
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

  const handleEdit = (company: CompanyData) => {
    setEditingCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingCompany) return;
    
    updateCompanyMutation.mutate({
      id: editingCompany.id,
      data: editingCompany,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this company?')) {
      deleteCompanyMutation.mutate(id);
    }
  };

  const handleRefresh = (id: string) => {
    refreshCompanyMutation.mutate(id);
  };

  if (companies.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground" data-testid="text-no-companies">
            No companies added yet. Click "Add Company" to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Field Visibility Controls */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Display Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <Label className="flex items-center cursor-pointer">
              <Switch
                id="show-low-high-table"
                checked={fieldVisibility.showLowHigh}
                onCheckedChange={(checked) =>
                  onFieldVisibilityChange({ ...fieldVisibility, showLowHigh: checked })
                }
                data-testid="switch-show-low-high"
              />
              <span className="ml-3 text-sm font-medium text-foreground">
                Show Low/High Range Columns
              </span>
            </Label>
            
            <Label className="flex items-center cursor-pointer">
              <Switch
                defaultChecked={true}
                disabled
                data-testid="switch-financial-colors"
              />
              <span className="ml-3 text-sm font-medium text-foreground">
                Financial Color Coding
              </span>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Main Data Table */}
      <Card className="w-full">
        <CardHeader className="bg-table-header">
          <CardTitle className="text-xl font-semibold">Company Financial Data</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time financial metrics and analysis
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-table-header">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    P/E
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    PY EPS
                  </th>
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      CY EPS Low
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    CY EPS Avg
                  </th>
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      CY EPS High
                    </th>
                  )}
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      CY EPS Chg % Low
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    CY EPS Chg %
                  </th>
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      CY EPS Chg % High
                    </th>
                  )}
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      CY P/E Low
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    CY P/E Avg
                  </th>
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      CY P/E High
                    </th>
                  )}
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      CY PEG Low
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    CY PEG Avg
                  </th>
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      CY PEG High
                    </th>
                  )}
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      NY EPS Low
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    NY EPS Avg
                  </th>
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      NY EPS High
                    </th>
                  )}
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      NY EPS Chg % Low
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    NY EPS Chg %
                  </th>
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      NY EPS Chg % High
                    </th>
                  )}
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      NY P/E Low
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    NY P/E Avg
                  </th>
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      NY P/E High
                    </th>
                  )}
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      NY PEG Low
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                    NY PEG Avg
                  </th>
                  {fieldVisibility.showLowHigh && (
                    <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                      NY PEG High
                    </th>
                  )}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {companies.map((company, index) => (
                  <tr
                    key={company.id}
                    className={`hover:bg-table-row-hover transition-colors ${
                      index % 2 === 0 ? 'bg-table-row-even' : 'bg-card'
                    }`}
                    data-testid={`row-company-${company.id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {company.symbol}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-foreground" data-testid={`text-company-name-${company.id}`}>
                            {company.companyName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {company.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground" data-testid={`text-price-${company.id}`}>
                      {formatCurrency(company.price)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(company.pe)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(company.pyEps)}
                    </td>
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.cyEpsLow ? formatNumber(company.cyEpsLow) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(company.cyEpsAvg)}
                    </td>
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.cyEpsHigh ? formatNumber(company.cyEpsHigh) : '-'}
                      </td>
                    )}
                    {fieldVisibility.showLowHigh && (
                      <td className={`px-4 py-3 text-right text-sm ${getFinancialColor(company.cyEpsChangePercentLow || 0, true)}`}>
                        {company.cyEpsChangePercentLow ? formatPercentage(company.cyEpsChangePercentLow) : '-'}
                      </td>
                    )}
                    <td className={`px-4 py-3 text-right text-sm ${getFinancialColor(company.cyEpsChangePercentAvg, true)}`}>
                      {formatPercentage(company.cyEpsChangePercentAvg)}
                    </td>
                    {fieldVisibility.showLowHigh && (
                      <td className={`px-4 py-3 text-right text-sm ${getFinancialColor(company.cyEpsChangePercentHigh || 0, true)}`}>
                        {company.cyEpsChangePercentHigh ? formatPercentage(company.cyEpsChangePercentHigh) : '-'}
                      </td>
                    )}
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.cyPeLow ? formatNumber(company.cyPeLow) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(company.cyPeAvg)}
                    </td>
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.cyPeHigh ? formatNumber(company.cyPeHigh) : '-'}
                      </td>
                    )}
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.cyPegLow ? formatNumber(company.cyPegLow) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(company.cyPegAvg)}
                    </td>
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.cyPegHigh ? formatNumber(company.cyPegHigh) : '-'}
                      </td>
                    )}
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.nyEpsLow ? formatNumber(company.nyEpsLow) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(company.nyEpsAvg)}
                    </td>
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.nyEpsHigh ? formatNumber(company.nyEpsHigh) : '-'}
                      </td>
                    )}
                    {fieldVisibility.showLowHigh && (
                      <td className={`px-4 py-3 text-right text-sm ${getFinancialColor(company.nyEpsChangePercentLow || 0, true)}`}>
                        {company.nyEpsChangePercentLow ? formatPercentage(company.nyEpsChangePercentLow) : '-'}
                      </td>
                    )}
                    <td className={`px-4 py-3 text-right text-sm ${getFinancialColor(company.nyEpsChangePercentAvg, true)}`}>
                      {formatPercentage(company.nyEpsChangePercentAvg)}
                    </td>
                    {fieldVisibility.showLowHigh && (
                      <td className={`px-4 py-3 text-right text-sm ${getFinancialColor(company.nyEpsChangePercentHigh || 0, true)}`}>
                        {company.nyEpsChangePercentHigh ? formatPercentage(company.nyEpsChangePercentHigh) : '-'}
                      </td>
                    )}
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.nyPeLow ? formatNumber(company.nyPeLow) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(company.nyPeAvg)}
                    </td>
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.nyPeHigh ? formatNumber(company.nyPeHigh) : '-'}
                      </td>
                    )}
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.nyPegLow ? formatNumber(company.nyPegLow) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {formatNumber(company.nyPegAvg)}
                    </td>
                    {fieldVisibility.showLowHigh && (
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {company.nyPegHigh ? formatNumber(company.nyPegHigh) : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefresh(company.id)}
                          disabled={refreshCompanyMutation.isPending}
                          className="h-8 w-8 p-0"
                          data-testid={`button-refresh-${company.id}`}
                        >
                          <RefreshCw className={`h-4 w-4 ${refreshCompanyMutation.isPending ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(company)}
                          className="h-8 w-8 p-0"
                          data-testid={`button-edit-${company.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(company.id)}
                          disabled={deleteCompanyMutation.isPending}
                          className="h-8 w-8 p-0 hover:text-destructive"
                          data-testid={`button-delete-${company.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-muted/50 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{companies.length}</span> companies
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {editingCompany && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-1">
                    Company Name
                  </Label>
                  <Input
                    type="text"
                    value={editingCompany.companyName}
                    onChange={(e) =>
                      setEditingCompany({
                        ...editingCompany,
                        companyName: e.target.value,
                      })
                    }
                    data-testid="input-edit-company-name"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-1">
                    Stock Price
                  </Label>
                  <Input
                    type="number"
                    value={editingCompany.price}
                    onChange={(e) =>
                      setEditingCompany({
                        ...editingCompany,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    data-testid="input-edit-price"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-1">
                    P/E Ratio
                  </Label>
                  <Input
                    type="number"
                    value={editingCompany.pe}
                    onChange={(e) =>
                      setEditingCompany({
                        ...editingCompany,
                        pe: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    data-testid="input-edit-pe"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-1">
                    Previous Year EPS
                  </Label>
                  <Input
                    type="number"
                    value={editingCompany.pyEps}
                    onChange={(e) =>
                      setEditingCompany({
                        ...editingCompany,
                        pyEps: parseFloat(e.target.value) || 0,
                      })
                    }
                    step="0.01"
                    data-testid="input-edit-py-eps"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updateCompanyMutation.isPending}
                  data-testid="button-save-edit"
                >
                  {updateCompanyMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
