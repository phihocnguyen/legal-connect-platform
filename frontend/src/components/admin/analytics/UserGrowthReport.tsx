"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface UserGrowthData {
  period: string;
  users: number;
  lawyers: number;
  posts: number;
  growth: number;
}

interface UserGrowthReportProps {
  data: UserGrowthData[];
}

export function UserGrowthReport({ data }: UserGrowthReportProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tăng trưởng người dùng</CardTitle>
          <CardDescription>
            Biểu đồ tăng trưởng người dùng, luật sư và bài viết theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="posts"
                fill="#8884d8"
                stroke="#8884d8"
                fillOpacity={0.3}
                name="Bài viết"
              />
              <Bar dataKey="users" fill="#3b82f6" name="Người dùng" />
              <Line
                type="monotone"
                dataKey="lawyers"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Luật sư"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ tăng trưởng</CardTitle>
          <CardDescription>
            Phần trăm tăng trưởng theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="growth"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Tăng trưởng (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
