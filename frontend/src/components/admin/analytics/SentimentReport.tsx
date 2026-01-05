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
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, ThumbsDown, Meh } from "lucide-react";

interface SentimentTrend {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface TopSentimentPost {
  id: number;
  title: string;
  sentiment: string;
  score: number;
  authorName: string;
}

interface SentimentData {
  totalAnalyzed: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  trend: SentimentTrend[];
  topPositivePosts: TopSentimentPost[];
  topNegativePosts: TopSentimentPost[];
}

interface SentimentReportProps {
  data: SentimentData;
}

const COLORS = ["#10b981", "#94a3b8", "#ef4444"]; // Positive, Neutral, Negative

export function SentimentReport({ data }: SentimentReportProps) {
  const pieData = [
    { name: "Tích cực", value: data.positiveCount },
    { name: "Trung lập", value: data.neutralCount },
    { name: "Tiêu cực", value: data.negativeCount },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tích cực</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.positivePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {data.positiveCount.toLocaleString()} nội dung
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trung lập</CardTitle>
            <Meh className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.neutralPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {data.neutralCount.toLocaleString()} nội dung
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiêu cực</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.negativePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {data.negativeCount.toLocaleString()} nội dung
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 md:col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Phân bổ cảm xúc</CardTitle>
            <CardDescription>Tỉ lệ % cảm xúc trên toàn hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Xu hướng cảm xúc</CardTitle>
            <CardDescription>Biến động cảm xúc theo thời gian</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="positive" stackId="a" fill="#10b981" name="Tích cực" />
                <Bar dataKey="neutral" stackId="a" fill="#94a3b8" name="Trung lập" />
                <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Tiêu cực" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" /> Nội dung tích cực tiêu biểu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPositivePosts.map((post) => (
                <div key={post.id} className="flex flex-col space-y-1 border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium line-clamp-1">{post.title}</span>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      {(post.score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> {post.authorName}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <ThumbsDown className="h-5 w-5" /> Nội dung tiêu cực cần chú ý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topNegativePosts.map((post) => (
                <div key={post.id} className="flex flex-col space-y-1 border-b pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium line-clamp-1">{post.title}</span>
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                      {(post.score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" /> {post.authorName}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
