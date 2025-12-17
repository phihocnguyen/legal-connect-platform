/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import {
  useAnalyticsReports,
  TimeRange,
  ReportType,
} from "@/hooks/use-analytics-reports";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, Download, RefreshCw } from "lucide-react";
import { ReportFilters } from "@/components/admin/analytics/ReportFilters";
import { UserGrowthReport } from "@/components/admin/analytics/UserGrowthReport";
import { EngagementReport } from "@/components/admin/analytics/EngagementReport";
import { CategoryReport } from "@/components/admin/analytics/CategoryReport";
import { ContentStatsReport } from "@/components/admin/analytics/ContentStatsReport";
import { HourlyActivityReport } from "@/components/admin/analytics/HourlyActivityReport";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    fetchDashboardStats,
  } = useAdminDashboard();
  const {
    loading: reportLoading,
    reportData,
    error: reportError,
    generateReport,
    exportReport,
  } = useAnalyticsReports();

  // Initialize state from URL query parameters
  const [timeRange, setTimeRange] = useState<TimeRange>(() => {
    const param = searchParams.get("timeRange");
    return (param as TimeRange) || "30days";
  });

  const [reportType, setReportType] = useState<ReportType>(() => {
    const param = searchParams.get("reportType");
    return (param as ReportType) || "user-growth";
  });

  const [fromDate, setFromDate] = useState<Date | undefined>(() => {
    const param = searchParams.get("fromDate");
    if (param) {
      try {
        return parse(param, "yyyy-MM-dd", new Date());
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  const [toDate, setToDate] = useState<Date | undefined>(() => {
    const param = searchParams.get("toDate");
    if (param) {
      try {
        return parse(param, "yyyy-MM-dd", new Date());
      } catch {
        return undefined;
      }
    }
    return undefined;
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("timeRange", timeRange);
    params.set("reportType", reportType);

    if (timeRange === "custom") {
      if (fromDate) {
        params.set("fromDate", format(fromDate, "yyyy-MM-dd"));
      }
      if (toDate) {
        params.set("toDate", format(toDate, "yyyy-MM-dd"));
      }
    }

    router.push(`?${params.toString()}`, { scroll: false });
  }, [timeRange, reportType, fromDate, toDate, router]);

  // Remove auto-generate - only generate on button click
  // useEffect(() => {
  //   if (reportType) {
  //     handleGenerateReport();
  //   }
  // }, [reportType, timeRange, fromDate, toDate]);

  // Removed handleGenerateReport - using generateReport directly from hook

  const handleExport = async (exportFormat: "pdf" | "excel" | "csv") => {
    await exportReport(reportType, timeRange, exportFormat, fromDate, toDate);
  };

  // Local state for filters before applying
  const [localReportType, setLocalReportType] =
    useState<ReportType>(reportType);
  const [localTimeRange, setLocalTimeRange] = useState<TimeRange>(timeRange);
  const [localFromDate, setLocalFromDate] = useState<Date | undefined>(
    fromDate
  );
  const [localToDate, setLocalToDate] = useState<Date | undefined>(toDate);

  const handleApplyFiltersAndGenerate = async () => {
    // Update state
    setReportType(localReportType);
    setTimeRange(localTimeRange);
    setFromDate(localFromDate);
    setToDate(localToDate);

    // Generate report with NEW values immediately (not waiting for state update)
    await generateReport({
      reportType: localReportType,
      timeRange: localTimeRange,
      fromDate: localFromDate,
      toDate: localToDate,
    });
  };

  const renderReport = () => {
    if (!reportData?.data || !Array.isArray(reportData.data)) {
      return null;
    }

    const data = reportData.data as any;

    switch (reportType) {
      case "user-growth":
        return <UserGrowthReport data={data} />;
      case "engagement":
        return <EngagementReport data={data} />;
      case "category-distribution":
        return <CategoryReport data={data} />;
      case "content-stats":
        return <ContentStatsReport data={data} />;
      case "hourly-activity":
        return <HourlyActivityReport data={data} />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo đang được phát triển</CardTitle>
              <CardDescription>
                Loại báo cáo này đang được phát triển. Vui lòng chọn loại báo
                cáo khác.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded overflow-auto">
                {JSON.stringify(reportData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        );
    }
  };

  if (statsLoading && !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (statsError && !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{statsError}</p>
            <Button onClick={fetchDashboardStats} variant="outline">
              Thử lại
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Báo cáo & Phân tích
            </h1>
            <p className="text-muted-foreground">
              Tạo và xuất báo cáo chi tiết về hoạt động hệ thống
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchDashboardStats}
              variant="outline"
              disabled={statsLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${statsLoading ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
            <Button
              onClick={() => handleExport("pdf")}
              variant="outline"
              disabled={!reportData || reportLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={() => handleExport("excel")}
              variant="outline"
              disabled={!reportData || reportLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tổng người dùng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalUsers?.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats.usersToday || 0} hôm nay
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Bài viết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalPosts?.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats.postsToday || 0} hôm nay
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Luật sư
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalLawyers?.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingLawyerApplications || 0} chờ duyệt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Cuộc trò chuyện
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.activeConversations || 0}
                </div>
                <p className="text-xs text-muted-foreground">Đang hoạt động</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Filters */}
        <ReportFilters
          timeRange={localTimeRange}
          reportType={localReportType}
          onTimeRangeChange={setLocalTimeRange}
          onReportTypeChange={setLocalReportType}
          onGenerate={handleApplyFiltersAndGenerate}
          loading={reportLoading}
          fromDate={localFromDate}
          toDate={localToDate}
          onFromDateChange={setLocalFromDate}
          onToDateChange={setLocalToDate}
        />

        {/* Report Display */}
        {reportLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {reportError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p>{reportError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {reportData && !reportLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-sm">
                Báo cáo được tạo từ API backend
              </Badge>
            </div>

            {renderReport()}
          </div>
        )}

        {!reportData && !reportLoading && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Chọn loại báo cáo và nhấn &quot;Tạo báo cáo&quot; để bắt đầu
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
