'use client';

import { useRouter } from 'next/navigation';
import { useMessagingUseCases } from '@/hooks/use-messaging-cases';
import { useAuthUseCases } from '@/hooks/use-auth-cases';
import { toast } from 'sonner';

export function useStartConversation() {
  const router = useRouter();
  const { getOrCreateConversation } = useMessagingUseCases();
  const { getCurrentUser } = useAuthUseCases();

  const startConversation = async (targetUserId: number, targetUserName?: string) => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        toast.error('Vui lòng đăng nhập để nhắn tin');
        router.push('/login');
        return;
      }

      if (currentUser.id === targetUserId) {
        toast.error('Không thể nhắn tin cho chính mình');
        return;
      }

      const loadingToast = toast.loading('Đang tạo cuộc trò chuyện...');

      const conversation = await getOrCreateConversation(currentUser.id, targetUserId);
      
      toast.dismiss(loadingToast);
      
      toast.success(`Đã tạo cuộc trò chuyện với ${targetUserName || 'người dùng'}`);
      
      router.push(`/messages?conversation=${conversation.id}`);
      
      return conversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
      throw error;
    }
  };

  return {
    startConversation
  };
}