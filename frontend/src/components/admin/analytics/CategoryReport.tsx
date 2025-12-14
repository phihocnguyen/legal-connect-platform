"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  value: number;
  posts: number;
  lawyers: number;
  [key: string]: string | number;
}

interface CategoryReportProps {
  data: CategoryData[];
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

export function CategoryReport({ data }: CategoryReportProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Phân bố danh mục</CardTitle>
          <CardDescription>
            Tỷ lệ phần trăm bài viết theo từng danh mục pháp luật
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết danh mục</CardTitle>
          <CardDescription>Thống kê chi tiết cho từng danh mục</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{cat.value}%</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pl-6">
                  <div className="text-sm">
                    <span className="text-gray-600">Bài viết:</span>{" "}
                    <span className="font-medium">{cat.posts}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Luật sư:</span>{" "}
                    <span className="font-medium">{cat.lawyers}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">TB/Luật sư:</span>{" "}
                    <span className="font-medium">
                      {cat.lawyers > 0
                        ? Math.round(cat.posts / cat.lawyers)
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
