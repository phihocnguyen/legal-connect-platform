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

interface RetentionData {
  period: string;
  retained: number;
  active: number;
  rate: number;
}

interface UserRetentionReportProps {
  data: RetentionData[];
}

export function UserRetentionReport({ data }: UserRetentionReportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tỷ lệ giữ chân người dùng</CardTitle>
        <CardDescription>
          Phân tích tỷ lệ người dùng quay lại sử dụng hệ thống
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
              dataKey="retained"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Người dùng giữ chân"
            />
            <Line
              type="monotone"
              dataKey="active"
              stroke="#10b981"
              strokeWidth={2}
              name="Người dùng hoạt động"
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Tỷ lệ giữ chân (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
