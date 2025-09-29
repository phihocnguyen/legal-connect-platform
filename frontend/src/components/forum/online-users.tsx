import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { parseVietnameseDate } from '@/lib/utils';

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
        <p>Lần cuối hoạt động: {parseVietnameseDate(user.lastSeen as string)?.toLocaleString('vi-vn')}</p>
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
    <div className="flex items-center gap-4 bg-white transition-all p-2">
      <Avatar className="w-12 h-12">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="bg-green-100 text-green-700 text-lg font-semibold">
          {user.userName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            asChild
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="truncate font-semibold text-gray-800 cursor-pointer hover:text-green-700 transition-colors">
              {user.userName}
            </div>
          </PopoverTrigger>

          <PopoverContent
            side="right"
            align="start"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={handleMouseLeave}
            className="w-72 p-4 bg-white rounded-xl shadow-lg border border-green-200"
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
  const { users : regularUsers, totalOnline, lawyers } = userList;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Đang trực tuyến</h3>

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

      {regularUsers.length > 0 && (
        <div className="mb-4 border-t pt-4">
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
