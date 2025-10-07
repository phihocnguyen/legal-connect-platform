'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Scale, 
  Upload, 
  FileText, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useLawyerCases } from '@/hooks/use-lawyer-cases';

interface LawyerApplicationForm {
  licenseNumber: string;
  lawSchool: string;
  graduationYear: number;
  specializations: string[];
  yearsOfExperience: number;
  currentFirm: string;
  bio: string;
  phoneNumber: string;
  officeAddress: string;
  documentUrls: string[];
}

const specializationOptions = [
  'Luật Dân sự',
  'Luật Hình sự', 
  'Luật Lao động',
  'Luật Thương mại',
  'Luật Hành chính',
  'Luật Gia đình và Hôn nhân',
  'Luật Đất đai',
  'Luật Sở hữu trí tuệ',
  'Luật Môi trường',
  'Luật Tài chính - Ngân hàng',
  'Luật Bảo hiểm',
  'Luật Thuế'
];

export default function LawyerApplicationPage() {
  const router = useRouter();
  const { uploadDocuments, submitApplication } = useLawyerCases();
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [form, setForm] = useState<LawyerApplicationForm>({
    licenseNumber: '',
    lawSchool: '',
    graduationYear: new Date().getFullYear(),
    specializations: [],
    yearsOfExperience: 0,
    currentFirm: '',
    bio: '',
    phoneNumber: '',
    officeAddress: '',
    documentUrls: []
  });

  const handleInputChange = (field: keyof LawyerApplicationForm, value: string | number | string[]) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecializationToggle = (specialization: string) => {
    setForm(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    try {
      setUploadingFiles(true);
      const fileArray = Array.from(files);
      
      const uploadedUrls = await uploadDocuments(fileArray);
      
      if (uploadedUrls) {
        setForm(prev => ({
          ...prev,
          documentUrls: [...prev.documentUrls, ...uploadedUrls]
        }));
        toast.success('Tài liệu đã được tải lên thành công!');
      } else {
        toast.error('Lỗi khi tải lên tài liệu');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Có lỗi xảy ra khi tải lên tài liệu');
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeDocument = (index: number) => {
    setForm(prev => ({
      ...prev,
      documentUrls: prev.documentUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.licenseNumber.trim()) {
      toast.error('Vui lòng nhập số giấy phép hành nghề');
      return;
    }
    
    if (!form.lawSchool.trim()) {
      toast.error('Vui lòng nhập trường luật tốt nghiệp');
      return;
    }
    
    if (form.specializations.length === 0) {
      toast.error('Vui lòng chọn ít nhất một chuyên môn');
      return;
    }
    
    if (!form.bio.trim()) {
      toast.error('Vui lòng nhập giới thiệu bản thân');
      return;
    }
    
    if (form.documentUrls.length === 0) {
      toast.error('Vui lòng tải lên ít nhất một tài liệu xác thực');
      return;
    }

    try {
      setLoading(true);
      
      const result = await submitApplication(form);
      
      if (result) {
        toast.success('Đơn đăng ký đã được gửi thành công!');
        router.push('/lawyer/application-status');
      } else {
        toast.error('Có lỗi xảy ra khi gửi đơn đăng ký');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Có lỗi xảy ra khi gửi đơn đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Đăng ký trở thành luật sư</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Hoàn thành biểu mẫu dưới đây để đăng ký trở thành luật sư trên nền tảng Legal Connect. 
            Đơn đăng ký của bạn sẽ được admin xem xét và phê duyệt.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Vui lòng cung cấp thông tin chính xác về bản thân
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNumber">Số giấy phép hành nghề *</Label>
                  <Input
                    id="licenseNumber"
                    value={form.licenseNumber}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    placeholder="Ví dụ: 123456/GPHP-LP"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input
                    id="phoneNumber"
                    value={form.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="0901234567"
                    pattern="[0-9]{10,11}"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="officeAddress">Địa chỉ văn phòng</Label>
                <Input
                  id="officeAddress"
                  value={form.officeAddress}
                  onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                  placeholder="Địa chỉ văn phòng luật sư"
                />
              </div>
            </CardContent>
          </Card>

          {/* Education & Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Học vấn và kinh nghiệm</CardTitle>
              <CardDescription>
                Thông tin về quá trình đào tạo và kinh nghiệm làm việc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lawSchool">Trường luật tốt nghiệp *</Label>
                  <Input
                    id="lawSchool"
                    value={form.lawSchool}
                    onChange={(e) => handleInputChange('lawSchool', e.target.value)}
                    placeholder="Ví dụ: Trường Đại học Luật Hà Nội"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="graduationYear">Năm tốt nghiệp *</Label>
                  <Input
                    id="graduationYear"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    value={form.graduationYear}
                    onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yearsOfExperience">Số năm kinh nghiệm *</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    max="50"
                    value={form.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currentFirm">Công ty/Tổ chức hiện tại</Label>
                  <Input
                    id="currentFirm"
                    value={form.currentFirm}
                    onChange={(e) => handleInputChange('currentFirm', e.target.value)}
                    placeholder="Tên công ty luật hoặc tổ chức"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle>Lĩnh vực chuyên môn *</CardTitle>
              <CardDescription>
                Chọn các lĩnh vực pháp lý mà bạn có chuyên môn (có thể chọn nhiều)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {specializationOptions.map((specialization) => (
                  <button
                    key={specialization}
                    type="button"
                    onClick={() => handleSpecializationToggle(specialization)}
                    className={`p-3 text-sm border rounded-lg transition-colors text-left ${
                      form.specializations.includes(specialization)
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {specialization}
                    {form.specializations.includes(specialization) && (
                      <CheckCircle className="h-4 w-4 ml-1 inline text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
              
              {form.specializations.length > 0 && (
                <div className="mt-4">
                  <Label>Đã chọn:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.specializations.map((spec) => (
                      <Badge key={spec} variant="default">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Giới thiệu bản thân *</CardTitle>
              <CardDescription>
                Viết một đoạn giới thiệu ngắn về bản thân, kinh nghiệm và thành tích
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Giới thiệu về bản thân, kinh nghiệm, thành tích và cam kết..."
                rows={6}
                maxLength={2000}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                {form.bio.length}/2000 ký tự
              </p>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu xác thực *</CardTitle>
              <CardDescription>
                Tải lên các tài liệu chứng minh (bằng cấp, giấy phép hành nghề, chứng chỉ...)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                    id="document-upload"
                    disabled={uploadingFiles}
                  />
                  <label
                    htmlFor="document-upload"
                    className="cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploadingFiles ? 'Đang tải lên...' : 'Nhấp để chọn tài liệu'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Hỗ trợ: PDF, DOC, DOCX, JPG, PNG (tối đa 10MB mỗi file)
                    </p>
                  </label>
                </div>

                {form.documentUrls.length > 0 && (
                  <div>
                    <Label>Tài liệu đã tải lên:</Label>
                    <div className="mt-2 space-y-2">
                      {form.documentUrls.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Tài liệu {index + 1}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Tất cả thông tin phải chính xác và trung thực</li>
                    <li>Đơn đăng ký sẽ được admin xem xét trong vòng 3-5 ngày làm việc</li>
                    <li>Bạn sẽ nhận được thông báo qua email về kết quả phê duyệt</li>
                    <li>Sau khi được phê duyệt, bạn có thể bắt đầu cung cấp dịch vụ tư vấn pháp lý</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingFiles}
            >
              {loading ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}