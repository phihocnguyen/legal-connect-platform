"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ContentStatsData {
  period: string;
  totalPosts: number;
  totalReplies: number;
  totalViews: number;
  averageRepliesPerPost: number;
}

// API response format
interface ApiContentStats {
  totalPosts: number;
  totalReplies: number;
  avgRepliesPerPost: number;
  topCategories: Array<{
    name: string;
    posts: number;
    growth: number;
  }>;
}

interface ContentStatsReportProps {
  data: ContentStatsData[] | ApiContentStats;
}

export function ContentStatsReport({ data }: ContentStatsReportProps) {
  console.log("[ContentStatsReport] Received data:", data);

  // Check if data is API response format (object with totalPosts)
  const isApiFormat = data && !Array.isArray(data) && "totalPosts" in data;
  console.log("[ContentStatsReport] Is API format:", isApiFormat);

  let totalPosts = 0;
  let totalReplies = 0;
  let totalViews = 0;
  let avgRepliesPerPost = "0";
  let chartData: ContentStatsData[] = [];
  let topCategories: Array<{ name: string; posts: number; growth: number }> =
    [];

  if (isApiFormat) {
    // Handle API response format
    const apiData = data as ApiContentStats;
    totalPosts = apiData.totalPosts || 0;
    totalReplies = apiData.totalReplies || 0;
    avgRepliesPerPost = apiData.avgRepliesPerPost?.toFixed(1) || "0";
    topCategories = apiData.topCategories || [];

    console.log("[ContentStatsReport] API data:", {
      totalPosts,
      totalReplies,
      avgRepliesPerPost,
      topCategories,
    });

    // Create chart data from categories
    if (topCategories.length > 0) {
      chartData = topCategories.map((cat) => ({
        period: cat.name,
        totalPosts: cat.posts,
        totalReplies: Math.floor(cat.posts * parseFloat(avgRepliesPerPost)),
        totalViews: cat.posts * 10, // Estimate views
        averageRepliesPerPost: parseFloat(avgRepliesPerPost),
      }));
    } else {
      // If no categories, create a single data point for overall stats
      chartData = [
        {
          period: "Tổng quan",
          totalPosts: totalPosts,
          totalReplies: totalReplies,
          totalViews: totalPosts * 10, // Estimate
          averageRepliesPerPost: parseFloat(avgRepliesPerPost),
        },
      ];
    }
  } else if (Array.isArray(data) && data.length > 0) {
    // Handle array format
    chartData = data;
    totalPosts = data.reduce((sum, item) => sum + (item.totalPosts || 0), 0);
    totalReplies = data.reduce(
      (sum, item) => sum + (item.totalReplies || 0),
      0
    );
    totalViews = data.reduce((sum, item) => sum + (item.totalViews || 0), 0);
    avgRepliesPerPost =
      totalPosts > 0 ? (totalReplies / totalPosts).toFixed(1) : "0";
  }

  console.log("[ContentStatsReport] Final chartData:", chartData);

  // Show message if no data at all
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thống kê nội dung</CardTitle>
          <CardDescription>
            Không có dữ liệu để hiển thị. Vui lòng thử lại với khoảng thời gian
            khác.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Backend API chưa trả về dữ liệu cho báo cáo này hoặc không có hoạt
            động nào trong khoảng thời gian đã chọn.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng bài viết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPosts.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng trả lời
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReplies.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng lượt xem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Trung bình trả lời/bài
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRepliesPerPost}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê nội dung theo thời gian</CardTitle>
          <CardDescription>
            Bài viết, trả lời và lượt xem theo từng khoảng thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalPosts" fill="#3b82f6" name="Bài viết" />
              <Bar dataKey="totalReplies" fill="#8b5cf6" name="Trả lời" />
              <Bar dataKey="totalViews" fill="#10b981" name="Lượt xem" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Replies Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trung bình trả lời mỗi bài viết</CardTitle>
          <CardDescription>
            Đo lường mức độ tương tác với các bài viết
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="averageRepliesPerPost"
                fill="#f59e0b"
                name="Trung bình trả lời/bài"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
