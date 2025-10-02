'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ApiLimitModalProps {
  open: boolean;
  onClose: () => void;
  remainingCalls: number;
}

export function ApiLimitModal({ open, onClose, remainingCalls }: ApiLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="w-6 h-6" />
            <DialogTitle>Cảnh báo giới hạn API</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          {remainingCalls === 0 ? (
            <>
              <p className="text-base font-semibold text-red-600">
                Bạn đã hết lượt sử dụng API!
              </p>
              <p className="text-sm text-muted-foreground">
                Bạn đã sử dụng hết số lượt gọi API cho phép. Để tiếp tục sử dụng các tính năng
                PDF Q/A và Chat Q/A, vui lòng:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Chờ đến kỳ làm mới tiếp theo</li>
                <li>Nâng cấp gói dịch vụ của bạn</li>
                <li>Liên hệ với bộ phận hỗ trợ</li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-base">
                Bạn còn <span className="font-bold text-yellow-600">{remainingCalls}</span> lượt
                sử dụng API.
              </p>
              <p className="text-sm text-gray-600">
                Vui lòng sử dụng cẩn thận. Khi hết lượt, bạn sẽ không thể sử dụng các tính năng
                PDF Q/A và Chat Q/A cho đến khi được làm mới.
              </p>
            </>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Đã hiểu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
