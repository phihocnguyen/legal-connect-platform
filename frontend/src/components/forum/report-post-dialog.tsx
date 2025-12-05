'use client';

import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePostReportCases } from '@/hooks/use-post-report-cases';

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
}

const REPORT_REASONS = [
  { value: 'Spam hoặc quảng cáo', label: 'Spam hoặc quảng cáo' },
  { value: 'Quấy rối hoặc bắt nạt', label: 'Quấy rối hoặc bắt nạt' },
  { value: 'Nội dung không phù hợp', label: 'Nội dung không phù hợp' },
  { value: 'Thông tin sai lệch', label: 'Thông tin sai lệch' },
];

export function ReportPostDialog({ open, onOpenChange, postId }: ReportPostDialogProps) {
  const [reportReason, setReportReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  
  const { createReport, checkUserReported } = usePostReportCases();

  useEffect(() => {
    const checkReport = async () => {
      if (open && postId) {
        try {
          const reported = await checkUserReported(postId);
          setHasReported(reported);
        } catch (error) {
          console.error('Error checking report status:', error);
        }
      }
    };
    
    checkReport();
  }, [open, postId, checkUserReported]);

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportReason) {
      toast.error('Vui lòng chọn lý do báo cáo');
      return;
    }

    if (reportReason === 'other' && !customReason.trim()) {
      toast.error('Vui lòng nhập lý do cụ thể');
      return;
    }

    try {
      setSubmittingReport(true);
      
      const finalReason = reportReason === 'other' ? customReason : reportReason;
      
      await createReport(postId, {
        reason: finalReason,
        description: reportReason === 'other' ? customReason : reportReason,
      });
      
      toast.success('Đã gửi báo cáo thành công', {
        description: 'Chúng tôi sẽ xem xét và xử lý báo cáo của bạn trong thời gian sớm nhất.'
      });
      
      handleClose();
      setHasReported(true);
    } catch (err) {
      console.error('Error submitting report:', err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể gửi báo cáo. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setReportReason('');
    setCustomReason('');
  };

  if (hasReported) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Đã báo cáo</DialogTitle>
            <DialogDescription>
              Bạn đã báo cáo bài viết này rồi. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmitReport}>
          <DialogHeader>
            <DialogTitle>Báo cáo bài viết</DialogTitle>
            <DialogDescription>
              Vui lòng chọn lý do báo cáo bài viết này. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {REPORT_REASONS.map((reason) => (
                <Label 
                  key={reason.value}
                  className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.value}
                    checked={reportReason === reason.value}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>{reason.label}</span>
                </Label>
              ))}

              <Label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="reportReason"
                  value="other"
                  checked={reportReason === 'other'}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Khác</span>
              </Label>

              {reportReason === 'other' && (
                <div className="ml-7 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Input
                    placeholder="Nhập lý do cụ thể..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submittingReport}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={submittingReport || !reportReason}
              className="bg-red-600 hover:bg-red-700"
            >
              {submittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

