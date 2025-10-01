'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit3 } from 'lucide-react';

interface RenameConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
  currentTitle: string;
  isRenaming?: boolean;
}

export function RenameConversationModal({
  isOpen,
  onClose,
  onConfirm,
  currentTitle,
  isRenaming = false,
}: RenameConversationModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setError('');
    }
  }, [isOpen, currentTitle]);

  const handleConfirm = () => {
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle) {
      setError('Tên cuộc trò chuyện không được để trống');
      return;
    }

    if (trimmedTitle.length < 3) {
      setError('Tên cuộc trò chuyện phải có ít nhất 3 ký tự');
      return;
    }

    if (trimmedTitle.length > 100) {
      setError('Tên cuộc trò chuyện không được vượt quá 100 ký tự');
      return;
    }

    onConfirm(trimmedTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRenaming) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
              <Edit3 className="h-5 w-5 text-teal-600" />
            </div>
            <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Nhập tên mới cho cuộc trò chuyện của bạn
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Tên cuộc trò chuyện</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tên cuộc trò chuyện..."
              disabled={isRenaming}
              className={error ? 'border-red-500' : ''}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isRenaming}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isRenaming || !title.trim()}
          >
            {isRenaming ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
