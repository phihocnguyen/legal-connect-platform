"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EngagementData {
  period: string;
  posts: number;
  replies: number;
  views: number;
  likes: number;
}

interface EngagementReportProps {
  data: EngagementData[];
}

export function EngagementReport({ data }: EngagementReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tương tác người dùng</CardTitle>
        <CardDescription>
          Theo dõi các hoạt động tương tác: bài viết, trả lời, lượt xem, likes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="posts"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Bài viết"
            />
            <Line
              type="monotone"
              dataKey="replies"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Trả lời"
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#10b981"
              strokeWidth={2}
              name="Lượt xem"
            />
            <Line
              type="monotone"
              dataKey="likes"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Likes"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
