'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle, User } from 'lucide-react';
import { useMessagingUseCases } from '@/hooks/use-messaging-cases';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface StartConversationButtonProps {
  currentUserId: number;
  targetUserId?: number; // Optional - if provided, skip user selection
  targetUserName?: string; // Optional - display name
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function StartConversationButton({ 
  currentUserId, 
  targetUserId, 
  targetUserName,
  className = '',
  variant = 'default' 
}: StartConversationButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number>(targetUserId || 0);
  const [loading, setLoading] = useState(false);
  const { getOrCreateConversation } = useMessagingUseCases();
  const router = useRouter();

  const handleStartConversation = async () => {
    if (!selectedUserId || selectedUserId === currentUserId) {
      toast.error('Please select a valid user');
      return;
    }

    setLoading(true);
    try {
      // Create or get existing conversation
      const conversation = await getOrCreateConversation(currentUserId, selectedUserId);
      
      toast.success('Conversation started successfully!');
      setOpen(false);
      
      // Navigate to messages page with conversation selected
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const buttonText = targetUserId ? `Message ${targetUserName || 'User'}` : 'Start Conversation';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <MessageCircle className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {/* If targetUserId is provided, show confirmation */}
          {targetUserId ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-8 h-8 text-gray-500" />
              <div>
                <p className="font-medium">{targetUserName || `User ${targetUserId}`}</p>
                <p className="text-sm text-gray-500">Start a conversation with this user</p>
              </div>
            </div>
          ) : (
            /* Manual user ID input */
            <div className="space-y-2">
              <Label htmlFor="userId">User ID to message</Label>
              <Input
                id="userId"
                type="number"
                placeholder="Enter user ID..."
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(parseInt(e.target.value) || 0)}
                min="1"
              />
              <p className="text-xs text-gray-500">
                Note: In a real app, this would be a user search/selection component
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStartConversation}
              disabled={loading || !selectedUserId}
              className="min-w-[100px]"
            >
              {loading ? 'Starting...' : 'Start Chat'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}