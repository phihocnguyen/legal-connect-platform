"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Bot, FileText, MessageSquare, TrendingUp, Clock, Zap } from "lucide-react";

interface AiStats {
  totalConversations: number;
  totalMessages: number;
  serviceUsage: Record<string, number>;
  usageTimeline: Array<{ period: string; value: number }>;
  hourlyPatterns: Array<{ hour: number; activity: number }>;
  usageGrowth: number;
}

interface AIUsageReportProps {
  data: AiStats;
}

export function AIUsageReport({ data }: AIUsageReportProps) {
  if (!data) return null;

  const serviceData = Object.entries(data.serviceUsage || {}).map(([name, value]) => ({
    name: name === "QA" ? "General RAG Chat" : name === "PDF_QA" ? "PDF Q&A" : name,
    value,
  }));

  const COLORS = ["#004646", "#008080", "#20B2AA", "#48D1CC"];

  const hourlyData = (data.hourlyPatterns || []).map(item => ({
    hour: `${item.hour}:00`,
    activity: item.activity,
  }));

  const sortedPatterns = [...(data.hourlyPatterns || [])].sort((a, b) => b.activity - a.activity);
  const peakHour = sortedPatterns[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Key Metrics row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#004646]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tổng cuộc hội thoại</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalConversations?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> +{data.usageGrowth}%
              </span>{" "}
              so với chu kỳ trước
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#006666]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tổng tin nhắn AI</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalMessages?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Trung bình {(data.totalMessages / (data.totalConversations || 1)).toFixed(1)} tin nhắn/phiên</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#008080]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Lượt dùng RAG Chat</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.serviceUsage?.QA?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Chiếm {((data.serviceUsage?.QA || 0) / (data.totalConversations || 1) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#20B2AA]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Lượt dùng PDF Q&A</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.serviceUsage?.PDF_QA?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Chiếm {((data.serviceUsage?.PDF_QA || 0) / (data.totalConversations || 1) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Timeline Chart */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Xu hướng sử dụng</CardTitle>
            <CardDescription>Số lượng tin nhắn AI theo thời gian</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.usageTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#004646" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#004646" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#004646" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" name="Tin nhắn" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Phân bổ dịch vụ</CardTitle>
            <CardDescription>Tỷ lệ sử dụng giữa các tính năng AI</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-4 space-y-2">
               <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <Zap className="h-4 w-4 text-[#004646]" /> General RAG Chat
                  </span>
                  <span>{data.serviceUsage?.QA || 0} lượt</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-[#008080]" /> PDF Q&A
                  </span>
                  <span>{data.serviceUsage?.PDF_QA || 0} lượt</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Hourly Patterns */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Hoạt động theo giờ</CardTitle>
            <CardDescription>Mật độ sử dụng AI trong 24 giờ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <XAxis dataKey="hour" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'rgba(0, 70, 70, 0.05)'}} />
                  <Bar dataKey="activity" fill="#004646" radius={[4, 4, 0, 0]} name="Hoạt động" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Insights & Peak Times */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Clock className="h-5 w-5 text-[#004646]" /> Phân tích sử dụng
            </CardTitle>
            <CardDescription>Dữ liệu tổng hợp từ hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
               <div className="p-4 rounded-xl bg-[#004646]/5 border border-[#004646]/10">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 rounded-lg bg-[#004646] text-white">
                        <Zap className="h-4 w-4" />
                     </div>
                     <span className="font-bold text-gray-900">Giờ cao điểm</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Thời gian AI được sử dụng nhiều nhất là:</p>
                  <div className="text-xl font-bold text-[#004646]">{peakHour?.hour || 0}:00</div>
                  <p className="text-xs text-muted-foreground mt-1">Với {peakHour?.activity || 0} ghi nhận hoạt động</p>
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Thông tin thêm</h4>
                  <ul className="space-y-3">
                     <li className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#004646]" />
                        <p className="text-sm text-gray-600">Dịch vụ <strong>RAG Chat</strong> là tính năng ưa thích nhất của người dùng.</p>
                     </li>
                     <li className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#004646]" />
                        <p className="text-sm text-gray-600">Lượt sử dụng <strong>PDF Q&A</strong> tăng mạnh vào các ngày làm việc.</p>
                     </li>
                     <li className="flex items-start gap-3">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#004646]" />
                        <p className="text-sm text-gray-600">Tỷ lệ tăng trưởng <strong>{data.usageGrowth}%</strong> cho thấy sự quan tâm ngày càng lớn.</p>
                     </li>
                  </ul>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
