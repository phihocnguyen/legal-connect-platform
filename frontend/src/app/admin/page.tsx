"use client";

import React, { useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Scale,
  FolderOpen,
  Clock,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminDashboard() {
  const { stats, loading, error, fetchDashboardStats } = useAdminDashboard();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (error && !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchDashboardStats} variant="outline">
              Thử lại
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p>Không có dữ liệu</p>
        </div>
      </AdminLayout>
    );
  }

  const userRoleData = [
    {
      name: "Người dùng",
      value: (stats.totalUsers || 0) - (stats.totalLawyers || 0),
      color: "#3b82f6",
    },
    { name: "Luật sư", value: stats.totalLawyers || 0, color: "#8b5cf6" },
    {
      name: "Đơn chờ duyệt",
      value: stats.pendingLawyerApplications || 0,
      color: "#ef4444",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Tổng quan hệ thống Legal Connect
            </p>
          </div>
          <Button onClick={fetchDashboardStats} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng người dùng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalUsers || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.usersToday || 0} hôm nay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng bài viết
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalPosts || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.postsToday || 0} hôm nay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Luật sư</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalLawyers || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +{stats.lawyerApplicationsToday || 0} hôm nay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cuộc trò chuyện
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.activeConversations || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Cuộc trò chuyện hoạt động
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Đơn chờ duyệt
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingLawyerApplications || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Đơn xin làm luật sư
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Người dùng hoạt động
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Tổng người dùng</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bài viết</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.totalPosts || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng bài viết trong hệ thống
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cuộc trò chuyện
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.activeConversations || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Cuộc trò chuyện hoạt động
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Tăng trưởng theo tháng</CardTitle>
              <CardDescription>
                Số lượng người dùng, luật sư và bài viết mới theo tháng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={[
                    { month: "T1", users: 100, lawyers: 10, posts: 50 },
                    { month: "T2", users: 120, lawyers: 12, posts: 60 },
                    { month: "T3", users: 150, lawyers: 15, posts: 80 },
                    { month: "T4", users: 180, lawyers: 18, posts: 100 },
                    { month: "T5", users: 200, lawyers: 20, posts: 120 },
                    {
                      month: "T6",
                      users: stats.totalUsers || 0,
                      lawyers: stats.totalLawyers || 0,
                      posts: stats.totalPosts || 0,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    name="Người dùng"
                  />
                  <Line
                    type="monotone"
                    dataKey="lawyers"
                    stroke="#8b5cf6"
                    name="Luật sư"
                  />
                  <Line
                    type="monotone"
                    dataKey="posts"
                    stroke="#10b981"
                    name="Bài viết"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Hoạt động theo tuần</CardTitle>
              <CardDescription>
                Bài viết, trả lời và lượt xem trong tuần
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { day: "T2", posts: 12, replies: 45, views: 234 },
                    { day: "T3", posts: 15, replies: 52, views: 289 },
                    { day: "T4", posts: 18, replies: 61, views: 312 },
                    { day: "T5", posts: 14, replies: 48, views: 276 },
                    { day: "T6", posts: 20, replies: 68, views: 345 },
                    { day: "T7", posts: 16, replies: 55, views: 298 },
                    { day: "CN", posts: 10, replies: 35, views: 201 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="posts" fill="#3b82f6" name="Bài viết" />
                  <Bar dataKey="replies" fill="#8b5cf6" name="Trả lời" />
                  <Bar dataKey="views" fill="#10b981" name="Lượt xem" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố người dùng</CardTitle>
              <CardDescription>Theo vai trò</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Thống kê hệ thống</CardTitle>
              <CardDescription>Tóm tắt các chỉ số chính</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm">Tổng người dùng</span>
                  <span className="font-bold">
                    {(stats.totalUsers || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm">Luật sư</span>
                  <span className="font-bold">
                    {(stats.totalLawyers || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm">Bài viết</span>
                  <span className="font-bold">
                    {(stats.totalPosts || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm">Cuộc trò chuyện hoạt động</span>
                  <span className="font-bold">
                    {(stats.activeConversations || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Đơn chờ duyệt</span>
                  <span className="font-bold text-orange-600">
                    {stats.pendingLawyerApplications || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
