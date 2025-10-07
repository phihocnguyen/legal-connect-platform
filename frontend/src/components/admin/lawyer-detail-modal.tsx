'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  GraduationCap, 
  Calendar, 
  Briefcase, 
  Building, 
  Phone, 
  MapPin, 
  FileText,
  Download,
  Clock
} from 'lucide-react';

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

interface LawyerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LawyerApplication | null;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

export function LawyerDetailModal({ 
  isOpen, 
  onClose, 
  application,
  onApprove,
  onReject 
}: LawyerDetailModalProps) {
  if (!application) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      default:
        return 'Chờ duyệt';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <User className="h-6 w-6 text-blue-600" />
            Chi tiết đơn đăng ký Luật sư
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về đơn đăng ký của {application.user.fullName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Basic Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{application.user.fullName}</h3>
              <p className="text-gray-600">{application.user.email}</p>
            </div>
            <Badge className={`px-3 py-1 ${getStatusColor(application.status)}`}>
              {getStatusText(application.status)}
            </Badge>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Thông tin cá nhân</h4>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{application.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium">{application.phoneNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Địa chỉ văn phòng</p>
                  <p className="font-medium">{application.officeAddress}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Thông tin nghề nghiệp</h4>
              
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Số giấy phép hành nghề</p>
                  <p className="font-medium">{application.licenseNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Trường luật</p>
                  <p className="font-medium">{application.lawSchool}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Năm tốt nghiệp</p>
                  <p className="font-medium">{application.graduationYear}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Số năm kinh nghiệm</p>
                  <p className="font-medium">{application.yearsOfExperience} năm</p>
                </div>
              </div>

              {application.currentFirm && (
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Công ty hiện tại</p>
                    <p className="font-medium">{application.currentFirm}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <h4 className="font-semibold text-lg border-b pb-2 mb-3">Chuyên môn</h4>
            <div className="flex flex-wrap gap-2">
              {application.specializations.map((spec, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <h4 className="font-semibold text-lg border-b pb-2 mb-3">Giới thiệu</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-gray-700">{application.bio}</p>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="font-semibold text-lg border-b pb-2 mb-3">Tài liệu đính kèm</h4>
            <div className="space-y-2">
              {application.documentUrls.map((url, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">Tài liệu {index + 1}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Xem
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Notes */}
          {application.adminNotes && (
            <div>
              <h4 className="font-semibold text-lg border-b pb-2 mb-3">Ghi chú admin</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">{application.adminNotes}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Ngày nộp đơn</p>
                <p className="font-medium">{formatDate(application.createdAt)}</p>
              </div>
            </div>
            {application.reviewedAt && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Ngày duyệt/từ chối</p>
                  <p className="font-medium">{formatDate(application.reviewedAt)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {application.status === 'PENDING' && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => onApprove?.(application.id)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Duyệt đơn
              </Button>
              <Button
                onClick={() => onReject?.(application.id)}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                Từ chối
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}