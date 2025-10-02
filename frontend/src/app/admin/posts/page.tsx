'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { 
  Search, 
  AlertTriangle, 
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Flag,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface ViolationPost {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
  };
  category: string;
  createdAt: string;
  reportCount: number;
  reportReasons: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
  adminNotes?: string;
  reviewedBy?: number;
  reviewedAt?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<ViolationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Review dialog state
  const [selectedPost, setSelectedPost] = useState<ViolationPost | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'ban'>('approve');
  const [reviewing, setReviewing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        sortBy: 'reportCount',
        sortDir: 'desc'
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }
      if (statusFilter && statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/posts/violations?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const result = await response.json();
      if (result.success) {
        setPosts(result.data.content || []);
        setTotalPages(result.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Có lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleReview = (post: ViolationPost, action: 'approve' | 'reject' | 'ban') => {
    setSelectedPost(post);
    setReviewAction(action);
    setAdminNotes('');
    setShowReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedPost) return;

    try {
      setReviewing(true);
      const params = new URLSearchParams();
      if (adminNotes.trim()) {
        params.append('adminNotes', adminNotes.trim());
      }

      const response = await fetch(
        `/api/admin/posts/${selectedPost.id}/${reviewAction}?${params}`,
        {
          method: 'PUT',
          credentials: 'include'
        }
      );

      const result = await response.json();
      
      if (result.success) {
        const actionText = {
          approve: 'Bài viết đã được phê duyệt!',
          reject: 'Bài viết đã bị từ chối!',
          ban: 'Bài viết và tác giả đã bị cấm!'
        };
        toast.success(actionText[reviewAction]);
        setShowReviewDialog(false);
        fetchPosts();
      } else {
        toast.error(result.message || 'Có lỗi xảy ra khi xử lý bài viết');
      }
    } catch (error) {
      console.error('Error reviewing post:', error);
      toast.error('Có lỗi xảy ra khi xử lý bài viết');
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Chờ kiểm duyệt</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600">Đã phê duyệt</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Bị từ chối</Badge>;
      case 'BANNED':
        return <Badge variant="destructive" className="bg-black">Bị cấm</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
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
              <CardTitle className="text-sm font-medium">Chờ kiểm duyệt</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {posts.filter(p => p.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã phê duyệt</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {posts.filter(p => p.status === 'APPROVED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bị từ chối</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {posts.filter(p => p.status === 'REJECTED').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bị cấm</CardTitle>
              <Ban className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {posts.filter(p => p.status === 'BANNED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>
              Tìm kiếm và lọc bài viết theo trạng thái
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
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ kiểm duyệt</SelectItem>
                  <SelectItem value="APPROVED">Đã phê duyệt</SelectItem>
                  <SelectItem value="REJECTED">Bị từ chối</SelectItem>
                  <SelectItem value="BANNED">Bị cấm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bài viết</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Báo cáo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="font-medium text-gray-900 truncate">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {post.content}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {post.category}
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
                            {post.reportCount} báo cáo
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(post.status)}
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
                          {post.status === 'PENDING' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleReview(post, 'approve')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReview(post, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Từ chối
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReview(post, 'ban')}
                                className="bg-black hover:bg-gray-800"
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Cấm
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <div className="text-sm text-gray-500">
                  Trang {page + 1} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Post Details Dialog */}
        {selectedPost && !showReviewDialog && (
          <Dialog open={true} onOpenChange={() => setSelectedPost(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chi tiết bài viết</DialogTitle>
                <DialogDescription>
                  Bài viết #{selectedPost.id} - {getStatusBadge(selectedPost.status)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Post Content */}
                <div>
                  <h3 className="text-lg font-medium mb-3">{selectedPost.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {selectedPost.content}
                  </p>
                  <Badge variant="outline">{selectedPost.category}</Badge>
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
                    <div className="space-y-1">
                      {selectedPost.reportReasons.map((reason, index) => (
                        <div key={index} className="text-sm text-red-600">
                          • {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedPost.adminNotes && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Ghi chú của admin</h3>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                      {selectedPost.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedPost(null)}>
                  Đóng
                </Button>
                {selectedPost.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => handleReview(selectedPost, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReview(selectedPost, 'reject')}
                    >
                      Từ chối
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReview(selectedPost, 'ban')}
                      className="bg-black hover:bg-gray-800"
                    >
                      Cấm
                    </Button>
                  </>
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
                {reviewAction === 'approve' && 'Phê duyệt bài viết'}
                {reviewAction === 'reject' && 'Từ chối bài viết'}
                {reviewAction === 'ban' && 'Cấm bài viết và tác giả'}
              </DialogTitle>
              <DialogDescription>
                {reviewAction === 'approve' && 'Bài viết sẽ được hiển thị công khai sau khi phê duyệt.'}
                {reviewAction === 'reject' && 'Bài viết sẽ bị ẩn và tác giả sẽ được thông báo.'}
                {reviewAction === 'ban' && 'Bài viết sẽ bị xóa và tác giả sẽ bị cấm hoạt động.'}
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
                  reviewAction === 'approve' ? 'Phê duyệt' : 
                  reviewAction === 'reject' ? 'Từ chối' : 'Cấm'
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}