'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
  Search, 
  Scale, 
  CheckCircle, 
  XCircle,
  Eye,
  FileText,
  User as UserIcon,
  Calendar,
  GraduationCap,
  Building,
  Phone,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface LawyerApplication {
  id: number;
  user: {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
  };
  licenseNumber: string;
  lawSchool: string;
  graduationYear: number;
  specializations: string[];
  yearsOfExperience: number;
  currentFirm?: string;
  bio: string;
  phoneNumber?: string;
  officeAddress?: string;
  documentUrls: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt: string;
}

export default function LawyerApplicationsPage() {
  const [applications, setApplications] = useState<LawyerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Review dialog state
  const [selectedApplication, setSelectedApplication] = useState<LawyerApplication | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewing, setReviewing] = useState(false);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        sortBy: 'createdAt',
        sortDir: 'desc'
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/lawyer-applications?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const result = await response.json();
      if (result.success) {
        setApplications(result.data.content || []);
        setTotalPages(result.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Có lỗi khi tải danh sách đơn đăng ký');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleReview = (application: LawyerApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setAdminNotes('');
    setShowReviewDialog(true);
  };

  const submitReview = async () => {
    if (!selectedApplication) return;

    try {
      setReviewing(true);
      const endpoint = reviewAction === 'approve' ? 'approve' : 'reject';
      const params = new URLSearchParams();
      if (adminNotes.trim()) {
        params.append('adminNotes', adminNotes.trim());
      }

      const response = await fetch(
        `/api/admin/lawyer-applications/${selectedApplication.id}/${endpoint}?${params}`,
        {
          method: 'PUT',
          credentials: 'include'
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success(
          reviewAction === 'approve' 
            ? 'Đơn đăng ký đã được phê duyệt!' 
            : 'Đơn đăng ký đã bị từ chối!'
        );
        setShowReviewDialog(false);
        fetchApplications(); // Refresh the list
      } else {
        toast.error(result.message || 'Có lỗi xảy ra khi xử lý đơn đăng ký');
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Có lỗi xảy ra khi xử lý đơn đăng ký');
    } finally {
      setReviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-600">Đã phê duyệt</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Bị từ chối</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn đăng ký luật sư</h1>
          <p className="text-gray-600 mt-2">
            Xem xét và phê duyệt đơn đăng ký trở thành luật sư
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
              <Scale className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter(a => a.status === 'PENDING').length}
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
                {applications.filter(a => a.status === 'APPROVED').length}
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
                {applications.filter(a => a.status === 'REJECTED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>
              Tìm kiếm và lọc đơn đăng ký theo trạng thái
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên, email hoặc số giấy phép..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('PENDING')}
                  size="sm"
                >
                  Chờ duyệt
                </Button>
                <Button
                  variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('APPROVED')}
                  size="sm"
                >
                  Đã duyệt
                </Button>
                <Button
                  variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('REJECTED')}
                  size="sm"
                >
                  Bị từ chối
                </Button>
                <Button
                  variant={statusFilter === '' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('')}
                  size="sm"
                >
                  Tất cả
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đơn đăng ký</CardTitle>
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
                    <TableHead>Người đăng ký</TableHead>
                    <TableHead>Thông tin nghề nghiệp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày nộp</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            {application.user.avatar ? (
                              <Image
                                className="h-10 w-10 rounded-full"
                                src={application.user.avatar}
                                alt={application.user.fullName}
                                width={40}
                                height={40}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {application.licenseNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.lawSchool} - {application.graduationYear}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.yearsOfExperience} năm kinh nghiệm
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(application.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                          {application.status === 'PENDING' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleReview(application, 'approve')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Duyệt
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReview(application, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Từ chối
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

        {/* Application Details Dialog */}
        {selectedApplication && !showReviewDialog && (
          <Dialog open={true} onOpenChange={() => setSelectedApplication(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Chi tiết đơn đăng ký</DialogTitle>
                <DialogDescription>
                  Đơn đăng ký #{selectedApplication.id} - {getStatusBadge(selectedApplication.status)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{selectedApplication.user.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Scale className="h-4 w-4 text-gray-400" />
                      <span>{selectedApplication.licenseNumber}</span>
                    </div>
                    {selectedApplication.phoneNumber && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedApplication.phoneNumber}</span>
                      </div>
                    )}
                    {selectedApplication.officeAddress && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{selectedApplication.officeAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Học vấn và kinh nghiệm</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span>{selectedApplication.lawSchool}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Tốt nghiệp {selectedApplication.graduationYear}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Scale className="h-4 w-4 text-gray-400" />
                      <span>{selectedApplication.yearsOfExperience} năm kinh nghiệm</span>
                    </div>
                    {selectedApplication.currentFirm && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{selectedApplication.currentFirm}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Chuyên môn</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.specializations.map((spec, index) => (
                      <Badge key={index} variant="outline">{spec}</Badge>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Giới thiệu bản thân</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedApplication.bio}
                  </p>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Tài liệu đính kèm</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedApplication.documentUrls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Tài liệu {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedApplication.adminNotes && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Ghi chú của admin</h3>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                      {selectedApplication.adminNotes}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedApplication(null)}>
                  Đóng
                </Button>
                {selectedApplication.status === 'PENDING' && (
                  <>
                    <Button
                      onClick={() => handleReview(selectedApplication, 'approve')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReview(selectedApplication, 'reject')}
                    >
                      Từ chối
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
                {reviewAction === 'approve' ? 'Phê duyệt đơn đăng ký' : 'Từ chối đơn đăng ký'}
              </DialogTitle>
              <DialogDescription>
                {reviewAction === 'approve' 
                  ? 'Sau khi phê duyệt, người dùng sẽ trở thành luật sư trên hệ thống.' 
                  : 'Vui lòng cung cấp lý do từ chối để người dùng có thể cải thiện đơn đăng ký.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Ghi chú {reviewAction === 'reject' ? '(bắt buộc)' : '(tùy chọn)'}
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    reviewAction === 'approve' 
                      ? 'Ghi chú về quá trình phê duyệt...' 
                      : 'Lý do từ chối và hướng dẫn cải thiện...'
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
                disabled={reviewing || (reviewAction === 'reject' && !adminNotes.trim())}
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              >
                {reviewing ? 'Đang xử lý...' : (reviewAction === 'approve' ? 'Phê duyệt' : 'Từ chối')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}