'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminPosts, type PostModerationDto } from '@/hooks/use-admin-posts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/admin/table-skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Search, Eye, Pin, Flame, ToggleLeft, ToggleRight, Trash2, FileText, Calendar, MessageSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { AdminLayout } from '@/components/admin/admin-layout';
import Image from 'next/image';

const PAGE_SIZE = 5;

export default function AdminPostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const categoryFilter = searchParams.get('category') || 'all';
  const pinFilter = searchParams.get('pinned') || 'all';
  const hotFilter = searchParams.get('hot') || 'all';
  const reportFilter = searchParams.get('reported') || 'all';
  const authorRoleFilter = searchParams.get('authorRole') || 'all';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc';

  // Local state
  const [posts, setPosts] = useState<PostModerationDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedPost, setSelectedPost] = useState<PostModerationDto | null>(null);
  
  // Local filter states (before applying)
  const [localStatusFilter, setLocalStatusFilter] = useState(statusFilter);
  const [localCategoryFilter, setLocalCategoryFilter] = useState(categoryFilter);
  const [localPinFilter, setLocalPinFilter] = useState(pinFilter);
  const [localHotFilter, setLocalHotFilter] = useState(hotFilter);
  const [localReportFilter, setLocalReportFilter] = useState(reportFilter);
  const [localAuthorRoleFilter, setLocalAuthorRoleFilter] = useState(authorRoleFilter);
  
  // Filtering loading state
  const [filterLoading, setFilterLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);

  const { loading, error, getAllPosts, updatePostStatus, deletePost, updatePostPinStatus, updatePostHotStatus, getPostDetails } = useAdminPosts();

  // Update URL parameters
  const updateUrl = (params: Record<string, string | number>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === '' || value === 'all' || (key === 'page' && value === 1)) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, value.toString());
      }
    });

    router.push(`/admin/posts?${newSearchParams.toString()}`);
  };

  // Load posts
  const loadPosts = useCallback(async () => {
    try {
      const params = {
        page: currentPage - 1, // Backend uses 0-based indexing
        size: PAGE_SIZE,
        search: searchQuery || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
        sortBy,
        sortDir,
      };

      const result = await getAllPosts(params);
      setPosts(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      console.error('Failed to load posts:', err);
      toast.error('Failed to load posts');
    } finally {
      // Reset loading states after API completes
      setPaginationLoading(false);
      setFilterLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, sortBy, sortDir, getAllPosts]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handlers
  const handleSearch = () => {
    updateUrl({ search: localSearch, page: 1 });
  };

  const handleSort = (field: string) => {
    const newSortDir = sortBy === field && sortDir === 'desc' ? 'asc' : 'desc';
    updateUrl({ sortBy: field, sortDir: newSortDir, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setPaginationLoading(true);
    updateUrl({ page });
  };

  // Apply filters function
  const handleApplyFilters = () => {
    setFilterLoading(true);
    updateUrl({ 
      search: localSearch,
      status: localStatusFilter,
      category: localCategoryFilter,
      pinned: localPinFilter,
      hot: localHotFilter,
      reported: localReportFilter,
      authorRole: localAuthorRoleFilter,
      page: 1 
    });
  };

  // Filter handlers - now only update local state
  const handleCategoryFilter = (category: string) => {
    setLocalCategoryFilter(category);
  };

  const handlePinFilter = (pinned: string) => {
    setLocalPinFilter(pinned);
  };

  const handleHotFilter = (hot: string) => {
    setLocalHotFilter(hot);
  };

  const handleReportFilter = (reported: string) => {
    setLocalReportFilter(reported);
  };

  const handleAuthorRoleFilter = (authorRole: string) => {
    setLocalAuthorRoleFilter(authorRole);
  };

  // Local filtering function
  const getFilteredPosts = () => {
    return posts.filter(post => {
      // Category filter
      if (categoryFilter !== 'all' && post.categoryName !== categoryFilter) return false;
      
      // Pin filter
      if (pinFilter === 'pinned' && !post.isPinned) return false;
      if (pinFilter === 'unpinned' && post.isPinned) return false;
      
      // Hot filter  
      if (hotFilter === 'hot' && !post.isHot) return false;
      if (hotFilter === 'normal' && post.isHot) return false;
      
      // Report filter
      if (reportFilter === 'reported' && !post.isReported) return false;
      if (reportFilter === 'clean' && post.isReported) return false;
      
      // Author role filter
      if (authorRoleFilter !== 'all' && post.author.role !== authorRoleFilter) return false;
      
      return true;
    });
  };

  // Get unique categories for filter dropdown
  const getUniqueCategories = () => {
    const categories = [...new Set(posts.map(post => post.categoryName))];
    return categories.sort();
  };

  const filteredPosts = getFilteredPosts();

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (pinFilter !== 'all') count++;
    if (hotFilter !== 'all') count++;
    if (reportFilter !== 'all') count++;
    if (authorRoleFilter !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const handlePostAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      toast.success(successMessage);
      await loadPosts();
    } catch (err) {
      console.error('Action failed:', err);
      toast.error('Action failed. Please try again.');
    }
  };

  const handleToggleStatus = (post: PostModerationDto) => {
    handlePostAction(
      () => updatePostStatus(post.id, !post.isActive),
      `Post ${post.isActive ? 'deactivated' : 'activated'} successfully`
    );
  };

  const handleTogglePin = (post: PostModerationDto) => {
    handlePostAction(
      () => updatePostPinStatus(post.id, !post.isPinned),
      `Post ${post.isPinned ? 'unpinned' : 'pinned'} successfully`
    );
  };

  const handleToggleHot = (post: PostModerationDto) => {
    handlePostAction(
      () => updatePostHotStatus(post.id, !post.isHot),
      `Post ${post.isHot ? 'unmarked as hot' : 'marked as hot'} successfully`
    );
  };

  const handleDeletePost = (post: PostModerationDto) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      handlePostAction(
        () => deletePost(post.id),
        'Post deleted successfully'
      );
    }
  };

  const handleViewPost = async (postId: number) => {
    try {
      const post = await getPostDetails(postId);
      setSelectedPost(post);
    } catch (err) {
      console.error('Failed to load post details:', err);
      toast.error('Failed to load post details');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài viết</h1>
          <p className="text-gray-600 mt-2">
            Quản lý và kiểm duyệt tất cả bài viết trong forum
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalElements || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bài viết hoạt động</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredPosts.filter(p => p.isActive).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bài viết ghim</CardTitle>
              <Pin className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredPosts.filter(p => p.isPinned).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bài viết nổi bật</CardTitle>
              <Flame className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredPosts.filter(p => p.isHot).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>
            Hiển thị {filteredPosts.length || 0} trong tổng số {totalElements || 0} bài viết
          </span>
          {activeFilterCount > 0 && (
            <span>
              {filteredPosts.length || 0} bài viết phù hợp với bộ lọc
            </span>
          )}
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bộ lọc</CardTitle>
              <CardDescription>
                Tìm kiếm và lọc bài viết theo các tiêu chí
              </CardDescription>
            </div>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount} bộ lọc đang áp dụng
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung hoặc tác giả..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>Tìm kiếm</Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Bộ lọc cơ bản</label>
              <div className="flex flex-wrap gap-1">
                {/* Status Filter */}
                <div className="space-y-1 ml-1">
                  <label className="text-xs text-muted-foreground">Trạng thái</label>
                  <Select value={localStatusFilter} onValueChange={setLocalStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="inactive">Bị vô hiệu hóa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-1 ml-1">
                  <label className="text-xs text-muted-foreground">Danh mục</label>
                  <Select value={localCategoryFilter} onValueChange={handleCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {getUniqueCategories().map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pin Filter */}
                <div className="space-y-1 ml-1">
                  <label className="text-xs text-muted-foreground">Ghim</label>
                  <Select value={localPinFilter} onValueChange={handlePinFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Ghim" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pinned">Đã ghim</SelectItem>
                      <SelectItem value="unpinned">Chưa ghim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Hot Filter */}
                <div className="space-y-1 ml-1">
                  <label className="text-xs text-muted-foreground">Nổi bật</label>
                  <Select value={localHotFilter} onValueChange={handleHotFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Nổi bật" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="hot">Nổi bật</SelectItem>
                      <SelectItem value="normal">Bình thường</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Filter Row 2 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Bộ lọc nâng cao</label>
              <div className="flex flex-wrap gap-1">
                {/* Report Filter */}
                <div className="space-y-1 ml-1">
                  <label className="text-xs text-muted-foreground">Báo cáo vi phạm</label>
                  <Select value={localReportFilter} onValueChange={handleReportFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Báo cáo vi phạm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="reported">Có báo cáo</SelectItem>
                      <SelectItem value="clean">Không có báo cáo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Author Role Filter */}
                <div className="space-y-1 ml-1">
                  <label className="text-xs text-muted-foreground">Vai trò tác giả</label>
                  <Select value={localAuthorRoleFilter} onValueChange={handleAuthorRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Vai trò tác giả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả vai trò</SelectItem>
                      <SelectItem value="USER">Người dùng</SelectItem>
                      <SelectItem value="LAWYER">Luật sư</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setLocalSearch('');
                  setLocalStatusFilter('all');
                  setLocalCategoryFilter('all');
                  setLocalPinFilter('all');
                  setLocalHotFilter('all');
                  setLocalReportFilter('all');
                  setLocalAuthorRoleFilter('all');
                  updateUrl({ 
                    status: 'all', 
                    category: 'all', 
                    pinned: 'all', 
                    hot: 'all', 
                    reported: 'all', 
                    authorRole: 'all',
                    search: '',
                    page: 1 
                  });
                }}
              >
                Xóa bộ lọc
              </Button>
              
              <Button 
                onClick={handleApplyFilters}
                disabled={filterLoading}
                className="min-w-24"
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết</CardTitle>
          <CardDescription>
            Quản lý và kiểm duyệt tất cả bài viết trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 text-center text-red-500">
              Error: {error}
            </div>
          )}

          {filterLoading || (loading && posts.length === 0) ? (
            <div className="text-center py-8">
              <LoadingSpinner size='md'/>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('title')}
                  >
                    Tiêu đề {sortBy === 'title' && (sortDir === 'desc' ? '↓' : '↑')}
                  </TableHead>
                  <TableHead>Tác giả</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-center">Thống kê</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    Ngày tạo {sortBy === 'createdAt' && (sortDir === 'desc' ? '↓' : '↑')}
                  </TableHead>
                  <TableHead className="text-center">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              {paginationLoading ? (
                <TableSkeleton rows={PAGE_SIZE} columns={7} />
              ) : (
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Không tìm thấy bài viết nào phù hợp với bộ lọc
                      </TableCell>
                    </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-sm">
                      <div className="space-y-1">
                        <div className="font-medium line-clamp-2">{post.title}</div>
                        <div className="flex gap-1">
                          {post.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              <Pin className="h-3 w-3 mr-1" />
                              Được ghim
                            </Badge>
                          )}
                          {post.isHot && (
                            <Badge variant="destructive" className="text-xs">
                              <Flame className="h-3 w-3 mr-1" />
                              Nổi bật
                            </Badge>
                          )}
                          {post.isReported && (
                            <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                              Bị báo cáo ({post.reportCount})
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {post.author.avatar && (
                          <Image
                            width={100}
                            height={100} 
                            src={post.author.avatar} 
                            alt={post.author.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm">{post.author.fullName}</div>
                          <div className="text-xs text-muted-foreground">{post.author.role}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.categoryName}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.replyCount}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={post.isActive ? "default" : "secondary"}
                        className={post.isActive ? "bg-green-500" : ""}
                      >
                        {post.isActive ? 'Hoạt động' : 'Bị vô hiệu hóa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View Details */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPost(post.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(post)}
                          title={post.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {post.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>

                        {/* Toggle Pin */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePin(post)}
                          title={post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                        >
                          <Pin className={`h-4 w-4 ${post.isPinned ? 'text-blue-500' : 'text-gray-400'}`} />
                        </Button>

                        {/* Toggle Hot */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleHot(post)}
                          title={post.isHot ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                        >
                          <Flame className={`h-4 w-4 ${post.isHot ? 'text-red-500' : 'text-gray-400'}`} />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post)}
                          title="Xóa bài viết"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                )}
                </TableBody>
              )}
            </Table>
          )}

          {/* Pagination */}
          {!filterLoading && !(loading && posts.length === 0) && totalPages > 1 && (
            <div className="p-4 border-t">
              <Pagination
                currentPage={currentPage - 1}
                totalPages={totalPages}
                onPageChange={(page) => handlePageChange(page + 1)}
                totalElements={totalElements}
                pageSize={PAGE_SIZE}
              />
            </div>
          )}
        </CardContent>
      </Card>      {/* Post Details Dialog */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Chi tiết bài viết
              </DialogTitle>
              <DialogDescription>
                Xem nội dung chi tiết và thông tin bài viết
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Post Header */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedPost.categoryName}</Badge>
                  {selectedPost.isPinned && (
                    <Badge variant="secondary">
                      <Pin className="h-3 w-3 mr-1" />
                      Được ghim
                    </Badge>
                  )}
                  {selectedPost.isHot && (
                    <Badge variant="destructive">
                      <Flame className="h-3 w-3 mr-1" />
                      Nổi bật
                    </Badge>
                  )}
                  <Badge variant={selectedPost.isActive ? "default" : "secondary"}>
                    {selectedPost.isActive ? 'Hoạt động' : 'Bị vô hiệu hóa'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {selectedPost.author.avatar && (
                      <Image
                        width={100}
                        height={100} 
                        src={selectedPost.author.avatar} 
                        alt={selectedPost.author.fullName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span>Bởi {selectedPost.author.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(selectedPost.createdAt), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {selectedPost.views} lượt xem
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {selectedPost.replyCount} phản hồi
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="prose max-w-none">
                <div 
                  className="whitespace-pre-wrap bg-muted/30 p-4 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                />
              </div>

              {/* Author Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Thông tin tác giả</h3>
                <div className="flex items-center gap-4">
                  {selectedPost.author.avatar && (
                    <Image 
                      src={selectedPost.author.avatar} 
                      width={100}
                      height={100}
                      alt={selectedPost.author.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{selectedPost.author.fullName}</div>
                    <div className="text-sm text-muted-foreground">{selectedPost.author.email}</div>
                    <Badge variant="outline" className="mt-1">{selectedPost.author.role}</Badge>
                  </div>
                </div>
              </div>

              {/* Moderation Info */}
              {(selectedPost.isReported || selectedPost.reason) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-orange-600">Thông tin kiểm duyệt</h3>
                  {selectedPost.isReported && (
                    <div className="mb-2">
                      <Badge variant="outline" className="border-orange-500 text-orange-600">
                        Bị báo cáo {selectedPost.reportCount} lần
                      </Badge>
                    </div>
                  )}
                  {selectedPost.reason && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="font-medium text-orange-800">Lý do vi phạm:</div>
                      <div className="text-orange-700">{selectedPost.reason}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </AdminLayout>
  );
}