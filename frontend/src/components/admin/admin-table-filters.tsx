import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export interface FilterField {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  columnSpan?: 1 | 2 | 3 | 4; // For responsive grid layout
}

export interface FilterRow {
  fields: FilterField[];
}

export interface AdminTableFiltersProps {
  // Search functionality
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filter rows (each row contains multiple filter fields)
  filterRows: FilterRow[];

  // Apply/Reset functionality
  onApplyFilters: () => void;
  onResetFilters?: () => void;
  isLoading?: boolean;

  // Filter panel state
  showFilters?: boolean;
  onToggleFilters?: () => void;

  // Active filter count (for badge)
  activeFilterCount?: number;

  // Custom actions (optional)
  customActions?: ReactNode;
}

export function AdminTableFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  filterRows,
  onApplyFilters,
  onResetFilters,
  isLoading = false,
  showFilters = false,
  onToggleFilters,
  activeFilterCount = 0,
  customActions,
}: AdminTableFiltersProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onApplyFilters();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {onToggleFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="h-10 px-3"
            >
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 min-w-5 flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}

          {/* Search bar - takes remaining space */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10 h-10"
            />
          </div>

          {/* Custom actions (if any) */}
          {customActions}

          {/* Apply button */}
          <Button
            size="sm"
            onClick={onApplyFilters}
            disabled={isLoading}
            className="h-10 px-4"
          >
            Áp dụng
          </Button>

          {/* Reset button (optional) */}
          {onResetFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              disabled={isLoading}
              className="h-10 px-4"
            >
              Đặt lại
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Collapsible Filter Panel */}
      {showFilters && (
        <CardContent className="pt-0">
          <div className="space-y-4 border-t pt-4">
            {filterRows.map((row, rowIndex) => (
              <div
                key={`filter-row-${rowIndex}`}
                className="grid grid-cols-1 md:grid-cols-4 gap-3"
              >
                {row.fields.map((field) => (
                  <div
                    key={field.id}
                    className={`space-y-1.5 ${
                      field.columnSpan && field.columnSpan > 1
                        ? `md:col-span-${field.columnSpan}`
                        : ""
                    }`}
                  >
                    <label className="text-xs font-medium text-muted-foreground">
                      {field.label}
                    </label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
