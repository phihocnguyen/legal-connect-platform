import { useState } from "react";
import { apiClient } from "@/lib/axiosInstance";
import { toast } from "sonner";
import { format } from "date-fns";

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

interface ReportData {
  data?: unknown;
  [key: string]: unknown;
}

interface GenerateReportParams {
  reportType: ReportType;
  timeRange: TimeRange;
  fromDate?: Date;
  toDate?: Date;
}

export function useAnalyticsReports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async ({
    reportType,
    timeRange,
    fromDate,
    toDate,
  }: GenerateReportParams) => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = { timeRange };

      // If custom time range, add fromDate and toDate
      if (timeRange === "custom") {
        if (fromDate) {
          params.fromDate = format(fromDate, "yyyy-MM-dd");
        }
        if (toDate) {
          params.toDate = format(toDate, "yyyy-MM-dd");
        }
      }

      const response = await apiClient.get(`/admin/analytics/${reportType}`, {
        params,
      });

      setReportData(response.data as ReportData);
      toast.success("Báo cáo đã được tạo thành công!");
      return response.data;
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || "Không thể tạo báo cáo";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (
    reportType: ReportType,
    timeRange: TimeRange,
    exportFormat: "pdf" | "excel" | "csv",
    fromDate?: Date,
    toDate?: Date
  ) => {
    try {
      const params: Record<string, string> = {
        timeRange,
        format: exportFormat,
      };

      // If custom time range, add fromDate and toDate
      if (timeRange === "custom") {
        if (fromDate) {
          params.fromDate = format(fromDate, "yyyy-MM-dd");
        }
        if (toDate) {
          params.toDate = format(toDate, "yyyy-MM-dd");
        }
      }

      const response = await apiClient.get(
        `/admin/analytics/${reportType}/export`,
        {
          params,
          responseType: "blob",
        }
      );

      // Create download link
      const blob = new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `report-${reportType}-${timeRange}.${exportFormat}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`Báo cáo đã được xuất dạng ${exportFormat.toUpperCase()}!`);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || "Không thể xuất báo cáo";
      toast.error(errorMessage);
      throw err;
    }
  };

  return {
    loading,
    reportData,
    error,
    generateReport,
    exportReport,
  };
}
