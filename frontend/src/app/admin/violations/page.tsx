'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/admin/table-skeleton';
import { 
  Search, 
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminViolations, type ViolationPostDto } from '@/hooks/use-admin-violations';

const PAGE_SIZE = 10;

export default function ViolationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'ALL';

  const [posts, setPosts] = useState<ViolationPostDto[]>([]);
  const [search, setSearch] = useState(searchQuery);
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [paginationLoading, setPaginationLoading] = useState(false);
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    disabled: 0,
  });

  // Review dialog state
  const [selectedPost, setSelectedPost] = useState<ViolationPostDto | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'ban'>('approve');
  const [reviewing, setReviewing] = useState(false);

  const {
    loading,
    getViolationPosts,
    updatePostStatus,
  } = useAdminViolations();

  // Update URL parameters
  const updateUrl = (params: Record<string, string | number>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === '' || value === 'ALL' || (key === 'page' && value === 1)) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value.toString());
      }
    });

    router.push(`/admin/violations?${newSearchParams.toString()}`);
  };

  const fetchPosts = useCallback(async () => {
    try {
      const params = {
        page: currentPage - 1, // Backend uses 0-based indexing
        size: PAGE_SIZE,
        sortBy: 'createdAt',
        sortDir: 'desc' as const,
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
        ...(statusFilter && statusFilter !== 'ALL' && { 
          isActive: statusFilter === 'ACTIVE' ? true : false 
        }),
      };

      const result = await getViolationPosts(params);
      if (result) {
        setPosts(result.content || []);
        setTotalPages(result.totalPages || 0);
        setTotalElements(result.totalElements || 0);
      }
    } finally {
      // Reset pagination loading after API completes
      setPaginationLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, getViolationPosts]);

  // Fetch stats separately - only on mount
  const fetchStats = useCallback(async () => {
    try {
      // Fetch all violations to calculate stats
      const [allResult, pendingResult, disabledResult] = await Promise.all([
        getViolationPosts({ page: 0, size: 1 }), // Just to get total
        getViolationPosts({ page: 0, size: 1, isActive: true }), // Active + reported = pending
        getViolationPosts({ page: 0, size: 1, isActive: false }), // Disabled
      ]);

      setStats({
        total: allResult.totalElements || 0,
        pending: pendingResult.totalElements || 0,
        resolved: disabledResult.totalElements || 0,
        disabled: disabledResult.totalElements || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [getViolationPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Fetch stats only on mount
  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleSearch = () => {
    updateUrl({ search, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setPaginationLoading(true);
    updateUrl({ page: page + 1 }); // Convert from 0-based to 1-based
  };

  const handleStatusFilterChange = (value: string) => {
    setPaginationLoading(true);
    setLocalStatusFilter(value);
    updateUrl({ status: value, page: 1 });
  };

  const handleReview = (post: ViolationPostDto, action: 'approve' | 'reject' | 'ban') => {
    setSelectedPost(post);
    setReviewAction(action);
    setAdminNotes('');
    setShowReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedPost) return;

    try {
      setReviewing(true);
      
      // Map review action to isActive boolean
      const isActive = reviewAction === 'approve';
      
      await updatePostStatus(selectedPost.id, isActive);
      
      const actionText = {
        approve: 'Bài viết đã được kích hoạt!',
        reject: 'Bài viết đã bị vô hiệu hóa!',
        ban: 'Bài viết đã bị vô hiệu hóa!'
      };
              toast.success(actionText[reviewAction]);
              setShowReviewDialog(false);
              fetchPosts();
              fetchStats();
    } catch (error) {
      console.error('Error reviewing post:', error);
      toast.error('Có lỗi xảy ra khi xử lý bài viết');
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (isActive: boolean | undefined) => {
    if (isActive === true) {
      return <Badge variant="default" className="bg-green-600">Hoạt động</Badge>;
    } else if (isActive === false) {
      return <Badge variant="destructive">Vô hiệu hóa</Badge>;
    }
    return <Badge variant="outline">Không xác định</Badge>;
  };

  const getSeverityColor = (reportCount: number) => {
    if (reportCount >= 10) return 'text-red-600 font-bold';
    if (reportCount >= 5) return 'text-orange-600 font-semibold';
    return 'text-yellow-600';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết vi phạm</h1>
          <p className="text-gray-600 mt-2">
            Kiểm duyệt và xử lý các bài viết bị báo cáo vi phạm
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng vi phạm</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <Flag className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xử lý</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã vô hiệu hóa</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disabled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
          <CardDescription>
            Tìm kiếm và lọc bài viết vi phạm theo trạng thái
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={localStatusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">Đã xử lý</SelectItem>
                <SelectItem value="INACTIVE">Đã vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Tìm kiếm</Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết vi phạm</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bài viết</TableHead>
                <TableHead>Tác giả</TableHead>
                <TableHead>Số báo cáo</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            {loading || paginationLoading ? (
              <TableSkeleton rows={PAGE_SIZE} columns={7} />
            ) : (
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <div className="font-medium text-gray-900 truncate">
                          {post.title}
                        </div>
                        <div 
                          className="text-sm text-gray-500 line-clamp-2"
                          dangerouslySetInnerHTML={{ 
                            __html: post.content?.substring(0, 150) || '' 
                          }}
                        />
                        <Badge variant="outline" className="mt-1">
                          {post.categoryName}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">{post.author.fullName}</div>
                          <div className="text-xs text-gray-500">{post.author.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 text-red-500" />
                        <span className={getSeverityColor(post.reportCount)}>
                          {post.reportCount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {post.reportReasons && post.reportReasons.length > 0 ? (
                          <div className="space-y-1">
                            {post.reportReasons.slice(0, 2).map((reason, idx) => (
                              <div key={idx} className="text-sm text-red-600 line-clamp-1">
                                • {reason}
                              </div>
                            ))}
                            {post.reportReasons.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{post.reportReasons.length - 2} lý do khác
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Chưa có</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(post.isActive)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPost(post)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        {!post.isActive ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleReview(post, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Kích hoạt
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReview(post, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Vô hiệu hóa
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={currentPage - 1} // Convert to 0-based for component
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalElements={totalElements}
                pageSize={PAGE_SIZE}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Details Dialog */}
      {selectedPost && !showReviewDialog && (
        <Dialog open={true} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết bài viết vi phạm</DialogTitle>
              <DialogDescription>
                Bài viết #{selectedPost.id} - {getStatusBadge(selectedPost.isActive)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Post Content */}
              <div>
                <h3 className="text-lg font-medium mb-3">{selectedPost.title}</h3>
                <div 
                  className="text-sm text-gray-700 leading-relaxed mb-4 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
                <Badge variant="outline">{selectedPost.categoryName}</Badge>
              </div>

              {/* Report Details */}
              <div>
                <h3 className="text-lg font-medium mb-3">Thông tin báo cáo</h3>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Flag className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-red-700">
                      {selectedPost.reportCount} báo cáo vi phạm
                    </span>
                  </div>
                  {selectedPost.reportReasons && selectedPost.reportReasons.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="font-medium text-sm text-red-700">Lý do báo cáo:</div>
                      {selectedPost.reportReasons.map((reason, idx) => (
                        <div key={idx} className="text-sm text-red-600">
                          • {reason}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedPost.violationReason && (
                    <div className="mt-3">
                      <div className="font-medium text-sm text-gray-700">Ghi chú Admin:</div>
                      <div className="text-sm text-gray-600">
                        {selectedPost.violationReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Author Info */}
              <div>
                <h3 className="text-lg font-medium mb-3">Thông tin tác giả</h3>
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="font-medium">{selectedPost.author.fullName}</div>
                    <div className="text-sm text-gray-500">{selectedPost.author.email}</div>
                    <Badge variant="outline" className="mt-1">{selectedPost.author.role}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPost(null)}>
                Đóng
              </Button>
              {!selectedPost.isActive ? (
                <Button
                  onClick={() => handleReview(selectedPost, 'approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Kích hoạt
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => handleReview(selectedPost, 'reject')}
                >
                  Vô hiệu hóa
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' && 'Kích hoạt bài viết'}
              {reviewAction === 'reject' && 'Vô hiệu hóa bài viết'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' && 'Bài viết sẽ được hiển thị công khai sau khi kích hoạt.'}
              {reviewAction === 'reject' && 'Bài viết sẽ bị ẩn và tác giả sẽ được thông báo.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Ghi chú {reviewAction === 'ban' ? '(bắt buộc)' : '(tùy chọn)'}
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  reviewAction === 'approve' 
                    ? 'Ghi chú về quá trình phê duyệt...' 
                    : reviewAction === 'reject'
                    ? 'Lý do từ chối và hướng dẫn sửa đổi...'
                    : 'Lý do cấm và các vi phạm nghiêm trọng...'
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Hủy
            </Button>
            <Button
              onClick={submitReview}
              disabled={reviewing || (reviewAction === 'ban' && !adminNotes.trim())}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              className={reviewAction === 'ban' ? 'bg-black hover:bg-gray-800' : ''}
            >
              {reviewing ? 'Đang xử lý...' : 
                reviewAction === 'approve' ? 'Kích hoạt' : 'Vô hiệu hóa'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}