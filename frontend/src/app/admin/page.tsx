'use client';

import React, { useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  Scale, 
  FolderOpen,
  Clock,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Activity,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';

export default function AdminDashboard() {
  const { stats, loading, error, fetchDashboardStats, refreshStats } = useAdminDashboard();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTERED':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'POST_CREATED':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'LAWYER_APPLIED':
        return <Scale className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'USER_REGISTERED':
        return 'bg-blue-100 text-blue-800';
      case 'POST_CREATED':
        return 'bg-green-100 text-green-800';
      case 'LAWYER_APPLIED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thống kê...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchDashboardStats()}>
              <RefreshCw className="h-4 w-4 mr-2" />
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
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-gray-600">Không có dữ liệu</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
            <p className="text-gray-600 mt-2">
              Cập nhật lần cuối: {formatDate(stats.lastUpdated)}
            </p>
          </div>
          <Button 
            onClick={refreshStats} 
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stats.newUsersThisMonth} tháng này
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalPosts)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stats.newPostsThisMonth} tháng này
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Luật sư</CardTitle>
              <Scale className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalLawyers)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stats.newLawyersThisMonth} tháng này
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Danh mục</CardTitle>
              <FolderOpen className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalCategories)}</div>
              <p className="text-xs text-muted-foreground">
                Tổng danh mục diễn đàn
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Đơn đăng ký luật sư
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatNumber(stats.activeUsers)}</div>
              <p className="text-xs text-muted-foreground">
                Trong 30 ngày qua
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Báo cáo vi phạm</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.reportedPosts}</div>
              <p className="text-xs text-muted-foreground">
                Bài viết được báo cáo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Popular Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>
                Các hoạt động mới nhất trên hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivities.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getActivityColor(activity.type)}`}
                        >
                          {activity.type.replace('_', ' ').toLowerCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Bài viết phổ biến</CardTitle>
              <CardDescription>
                Top bài viết có nhiều lượt xem nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popularPosts.slice(0, 6).map((post) => (
                  <div key={post.postId} className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {post.categoryName}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {formatNumber(post.views)}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {formatNumber(post.replies)}
                        </span>
                        <span>
                          {formatDate(post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}