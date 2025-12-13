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

interface LawyerData {
  name: string;
  responses: number;
  avgResponseTime: number;
  satisfaction: number;
  activeClients: number;
}

interface LawyerPerformanceReportProps {
  data: LawyerData[];
}

export function LawyerPerformanceReport({
  data,
}: LawyerPerformanceReportProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Hiệu suất luật sư</CardTitle>
          <CardDescription>
            Đánh giá hiệu suất làm việc của các luật sư trên hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="responses" fill="#3b82f6" name="Số phản hồi" />
              <Bar
                dataKey="activeClients"
                fill="#10b981"
                name="Khách hàng hoạt động"
              />
              <Bar dataKey="satisfaction" fill="#f59e0b" name="Điểm hài lòng" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết hiệu suất</CardTitle>
          <CardDescription>Thống kê chi tiết cho từng luật sư</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((lawyer, idx) => (
              <div key={idx} className="border-b pb-4 last:border-0">
                <h3 className="font-semibold mb-2">{lawyer.name}</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Phản hồi:</span>{" "}
                    <span className="font-medium">{lawyer.responses}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời gian TB:</span>{" "}
                    <span className="font-medium">
                      {lawyer.avgResponseTime}h
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Hài lòng:</span>{" "}
                    <span className="font-medium">{lawyer.satisfaction}/5</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Khách hàng:</span>{" "}
                    <span className="font-medium">{lawyer.activeClients}</span>
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
