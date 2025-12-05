import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Mail, Calendar, MessageCircle } from 'lucide-react';
import { User, UserRole } from '@/domain/entities';
import { useStartConversation } from '@/hooks/use-start-conversation';

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { startConversation } = useStartConversation();

  const handleStartConversation = async () => {
    await startConversation(user.id, user.fullName);
  };

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'LAWYER': return 'Luật sư';
      case 'ADMIN': return 'Quản trị viên';
      case 'USER': return 'Thành viên';
      default: return 'Thành viên';
    }
  };

  const getRoleBadgeStyle = (role: UserRole): string => {
    switch (role) {
      case 'LAWYER': return 'bg-[#004646] text-white';
      case 'ADMIN': return 'bg-red-600 text-white';
      case 'USER': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex items-start gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback className="text-2xl">
                {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <Badge className={`mb-2 ${getRoleBadgeStyle(user.role)}`}>
              {getRoleDisplayName(user.role)}
            </Badge>
            
            {user.role === 'LAWYER' && user.lawyerVerified && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Shield className="w-4 h-4" />
                <span>Đã xác thực</span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user.fullName}
              </h1>
              
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Tham gia 12/9/25</span>
                </div>
              </div>

              {user.role === 'LAWYER' && user.lawyerLicenseNumber && (
                <div className="text-sm text-gray-600 mb-4">
                  Số chứng chỉ hành nghề: {user.lawyerLicenseNumber}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="default" 
                className="flex items-center gap-2"
                onClick={handleStartConversation}
              >
                <MessageCircle className="w-4 h-4" />
                Nhắn tin
              </Button>
              <Button variant="outline">
                Theo dõi
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}