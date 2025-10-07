'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, 
  CheckCircle, 
  Clock, 
  XCircle,
  FileText,
  Calendar,
  User,
  AlertCircle
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

export default function LawyerApplicationStatusPage() {
  const [application, setApplication] = useState<LawyerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [canApply, setCanApply] = useState(false);

  useEffect(() => {
    fetchApplicationStatus();
  }, []);

  const fetchApplicationStatus = async () => {
    try {
      setLoading(true);
      
      // First check if user can apply
      const canApplyResponse = await fetch('/api/lawyer/can-apply', {
        credentials: 'include'
      });
      const canApplyResult = await canApplyResponse.json();
      console.log('Can apply result:', canApplyResult);
      setCanApply(canApplyResult.data);

      // Then try to get existing application
      const response = await fetch('/api/lawyer/application', {
        credentials: 'include'
      });
      
      const result = await response.json();
      console.log('Application result:', result);
      
      if (result.success && result.data) {
        setApplication(result.data);
      }
    } catch (error) {
      console.error('Error fetching application status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Đơn đăng ký của bạn đang được admin xem xét. Thời gian xử lý thường từ 3-5 ngày làm việc.';
      case 'APPROVED':
        return 'Chúc mừng! Đơn đăng ký của bạn đã được phê duyệt. Bạn hiện tại đã là luật sư trên nền tảng.';
      case 'REJECTED':
        return 'Đơn đăng ký của bạn đã bị từ chối. Vui lòng xem ghi chú của admin bên dưới.';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // User can apply (hasn't applied yet)
  if (canApply && !application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Scale className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bạn chưa có đơn đăng ký
            </h1>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Bạn có thể đăng ký trở thành luật sư trên nền tảng Legal Connect để cung cấp 
              dịch vụ tư vấn pháp lý cho cộng đồng.
            </p>
            <Button asChild size="lg">
              <Link href="/lawyer/apply">
                <Scale className="h-5 w-5 mr-2" />
                Đăng ký ngay
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User has no application and cannot apply (probably already a lawyer)
  if (!application && !canApply) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bạn đã là luật sư được xác thực
            </h1>
            <p className="text-gray-600 mb-8">
              Bạn đã hoàn thành quá trình đăng ký và được phê duyệt làm luật sư trên nền tảng Legal Connect.
            </p>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/profile">Xem hồ sơ</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Về trang chủ</Link>
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Không tìm thấy đơn đăng ký
            </h1>
            <p className="text-gray-600 mb-8">
              Có lỗi xảy ra khi tải thông tin đơn đăng ký của bạn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Scale className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Trạng thái đơn đăng ký</h1>
          <p className="text-gray-600 mt-2">
            Theo dõi tình trạng đơn đăng ký luật sư của bạn
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(application.status)}
                <div>
                  <CardTitle>Trạng thái đơn đăng ký</CardTitle>
                  <CardDescription>
                    Đơn đăng ký #{application.id}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(application.status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              {getStatusMessage(application.status)}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Ngày nộp đơn:</span>
                <span className="font-medium">
                  {new Date(application.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              
              {application.reviewedAt && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Ngày xem xét:</span>
                  <span className="font-medium">
                    {new Date(application.reviewedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </div>

            {application.adminNotes && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Ghi chú từ admin:</h4>
                <p className="text-blue-800 text-sm">{application.adminNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Thông tin cá nhân</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Số giấy phép:</span>
                <p className="font-medium">{application.licenseNumber}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Trường luật:</span>
                <p className="font-medium">{application.lawSchool}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Năm tốt nghiệp:</span>
                <p className="font-medium">{application.graduationYear}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Kinh nghiệm:</span>
                <p className="font-medium">{application.yearsOfExperience} năm</p>
              </div>
              {application.currentFirm && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Công ty hiện tại:</span>
                  <p className="font-medium">{application.currentFirm}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5" />
                <span>Chuyên môn</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {application.specializations.map((spec, index) => (
                  <Badge key={index} variant="outline">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Giới thiệu bản thân</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{application.bio}</p>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Tài liệu đã nộp</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {application.documentUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Tài liệu {index + 1}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}