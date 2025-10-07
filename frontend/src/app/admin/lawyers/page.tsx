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
  User as UserIcon
} from 'lucide-react';
import { useAdminCases } from '@/hooks/use-admin-cases';
import { LawyerApplication } from '@/domain/entities';
import { LawyerDetailModal } from '@/components/admin/lawyer-detail-modal';

export default function LawyerApplicationsPage() {
  const [applications, setApplications] = useState<LawyerApplication[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Use admin cases hook
  const {
    loading,
    getLawyerApplications,
    approveLawyerApplication,
    rejectLawyerApplication,
  } = useAdminCases();

  // Modal state
  const [selectedApplication, setSelectedApplication] = useState<LawyerApplication | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Review dialog state (for approve/reject actions)
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  const fetchApplications = useCallback(async () => {
    const params = {
      page,
      size: 10,
      sortBy: 'createdAt',
      sortDir: 'desc' as const,
      ...(search.trim() && { search: search.trim() }),
      ...(statusFilter && statusFilter !== '' && { status: statusFilter }),
    };

    const result = await getLawyerApplications(params);
    if (result) {
      console.log('Fetched lawyer applications:', result);
      setApplications(result.content || []);
      setTotalPages(result.totalPages || 0);
    } else {
      console.log('No result from getLawyerApplications');
    }
  }, [page, search, statusFilter, getLawyerApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleReview = (application: LawyerApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application);
    setReviewAction(action);
    setAdminNotes('');
    setShowReviewDialog(true);
  };

  const handleViewDetails = (application: LawyerApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleModalApprove = async () => {
    setShowModal(false);
    if (selectedApplication) {
      handleReview(selectedApplication, 'approve');
    }
  };

  const handleModalReject = async () => {
    setShowModal(false);
    if (selectedApplication) {
      handleReview(selectedApplication, 'reject');
    }
  };

  const submitReview = async () => {
    if (!selectedApplication) return;

    const success = reviewAction === 'approve'
      ? await approveLawyerApplication(selectedApplication.id, adminNotes.trim() || undefined)
      : await rejectLawyerApplication(selectedApplication.id, adminNotes.trim() || undefined);

    if (success) {
      setShowReviewDialog(false);
      fetchApplications(); // Refresh the list
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
                            <button
                              onClick={() => handleViewDetails(application)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                            >
                              {application.user.fullName}
                            </button>
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
                            onClick={() => handleViewDetails(application)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
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

        {/* Lawyer Detail Modal */}
        <LawyerDetailModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          application={selectedApplication}
          onApprove={handleModalApprove}
          onReject={handleModalReject}
        />

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
                disabled={loading || (reviewAction === 'reject' && !adminNotes.trim())}
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              >
                {loading ? 'Đang xử lý...' : (reviewAction === 'approve' ? 'Phê duyệt' : 'Từ chối')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}