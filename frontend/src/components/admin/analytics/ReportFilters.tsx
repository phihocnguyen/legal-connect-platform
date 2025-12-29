"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { BarChart3, Filter } from "lucide-react";

export type TimeRange =
  | "7days"
  | "30days"
  | "90days"
  | "1year"
  | "all"
  | "custom";
export type ReportType =
  | "user-growth"
  | "content-stats"
  | "engagement"
  | "category-distribution"
  | "hourly-activity";

interface ReportFiltersProps {
  timeRange: TimeRange;
  reportType: ReportType;
  onTimeRangeChange: (value: TimeRange) => void;
  onReportTypeChange: (value: ReportType) => void;
  onGenerate: () => void;
  loading?: boolean;
  fromDate?: Date;
  toDate?: Date;
  onFromDateChange?: (date: Date | undefined) => void;
  onToDateChange?: (date: Date | undefined) => void;
}

export function ReportFilters({
  timeRange,
  reportType,
  onTimeRangeChange,
  onReportTypeChange,
  onGenerate,
  loading = false,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: ReportFiltersProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Cấu hình báo cáo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 w-full">
          {/* First row: Time Range and Report Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <label className="text-sm font-medium">Khoảng thời gian</label>
              <Select value={timeRange} onValueChange={onTimeRangeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 ngày qua</SelectItem>
                  <SelectItem value="30days">30 ngày qua</SelectItem>
                  <SelectItem value="90days">90 ngày qua</SelectItem>
                  <SelectItem value="1year">1 năm qua</SelectItem>
                  <SelectItem value="all">Toàn bộ</SelectItem>
                  <SelectItem value="custom">Tuỳ chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại báo cáo</label>
              <Select value={reportType} onValueChange={onReportTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user-growth">
                    Tăng trưởng người dùng
                  </SelectItem>
                  <SelectItem value="content-stats">
                    Thống kê nội dung
                  </SelectItem>
                  <SelectItem value="engagement">
                    Tương tác người dùng
                  </SelectItem>
                  <SelectItem value="category-distribution">
                    Phân bố danh mục
                  </SelectItem>
                  <SelectItem value="hourly-activity">
                    Hoạt động theo giờ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second row: Custom Date Range (only shown when custom is selected) */}
          {timeRange === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-2">
                <label className="text-sm font-medium">Từ ngày</label>
                <DatePicker
                  date={fromDate}
                  onDateChange={onFromDateChange}
                  placeholder="Chọn ngày bắt đầu"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Đến ngày</label>
                <DatePicker
                  date={toDate}
                  onDateChange={onToDateChange}
                  placeholder="Chọn ngày kết thúc"
                />
              </div>
            </div>
          )}

          {/* Third row: Generate Button */}
          <div className="flex justify-end">
            <Button
              size="default"
              variant="default"
              onClick={onGenerate}
              disabled={loading}
              className="min-w-[140px]"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {loading ? "Đang tạo..." : "Tạo báo cáo"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
