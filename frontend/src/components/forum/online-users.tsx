import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

type User = {
  userId: string;
  userName: string;
  userType: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
  sessionId: string;
};

interface OnlineUser {
  users: User[];
  lawyers: User[];
  totalOnline: number;
}


const roleTitles = {
  admin: 'Quản trị viên',
  moderator: 'Điều hành viên',
  lawyer: 'Luật sư',
  user: 'Thành viên'
} as const;

interface OnlineUserListProps {
  userList: OnlineUser;
}

// Component hiển thị thông tin user trong popover
function UserPopupContent({ user }: { user: User }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.userName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-semibold">{user.userName}</h4>
          <Badge variant={user.userType === 'lawyer' ? 'default' : 'secondary'}>
            {roleTitles[user.userType as keyof typeof roleTitles]}
          </Badge>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <p>Trạng thái: <span className="text-green-600 font-medium">Đang online</span></p>
        <p>Lần cuối hoạt động: {user.lastSeen}</p>
        <p>ID: {user.userId}</p>
      </div>
    </div>
  );
}

// Component cho Lawyer với avatar và card riêng
function LawyerCard({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 hover:border-green-300 hover:bg-green-100 rounded-lg transition-colors">
      <Avatar className="w-10 h-10 ring-2 ring-green-300">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="bg-green-100 text-green-700">
          {user.userName[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            asChild
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="font-semibold text-green-700 cursor-pointer hover:text-green-800 transition-colors">
              {user.userName}
            </div>
          </PopoverTrigger>
          
          <PopoverContent
            side="right"
            align="start"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={handleMouseLeave}
            className="max-w-md p-4 bg-white rounded-md shadow-lg border-green-200"
            style={{ minWidth: 300 }}
          >
            <UserPopupContent user={user} />
          </PopoverContent>
        </Popover>
        
        <div className="text-sm text-green-600 font-medium">
          {roleTitles[user.userType as keyof typeof roleTitles]}
        </div>
      </div>
    </div>
  );
}

// Component cho User thường - chỉ hiển thị tên với popover
function UserPopover({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="text-blue-600 cursor-pointer hover:text-blue-800 transition-colors font-medium">
          {user.userName}
        </span>
      </PopoverTrigger>
      
      <PopoverContent
        side="top"
        align="center"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={handleMouseLeave}
        className="max-w-md p-4 bg-white rounded-md shadow-lg"
        style={{ minWidth: 300 }}
      >
        <UserPopupContent user={user} />
      </PopoverContent>
    </Popover>
  );
}

export function OnlineUserList({ userList }: OnlineUserListProps) {
  const { users, totalOnline } = userList;
  
  // Tách lawyers và users
  const lawyers = users.filter(user => user.userType === 'lawyer');
  const regularUsers = users.filter(user => user.userType !== 'lawyer');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Đang trực tuyến</h3>

      {/* Hiển thị Lawyers với avatar và card riêng */}
      {lawyers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-green-700 mb-3">Luật sư</h4>
          <div className="space-y-3">
            {lawyers.map((user) => (
              <LawyerCard key={user.userId} user={user} />
            ))}
          </div>
        </div>
      )}

      {/* Hiển thị Users thường theo hàng ngang */}
      {regularUsers.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-3">Thành viên</h4>
          <div className="flex flex-wrap gap-2">
            {regularUsers.map((user, index) => (
              <span key={user.userId} className="inline-flex items-center">
                <UserPopover user={user} />
                {index < regularUsers.length - 1 && (
                  <span className="text-gray-400 ml-1">,</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t text-sm text-gray-500">
        Tổng số người đang online: {totalOnline}
      </div>
    </div>
  );
}
