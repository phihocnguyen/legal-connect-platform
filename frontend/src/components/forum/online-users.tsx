import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

const roleColors = {
  admin: 'text-red-600',
  moderator: 'text-blue-600',
  lawyer: 'text-green-600',
  user: 'text-gray-600'
} as const;

const roleTitles = {
  admin: 'Quản trị viên',
  moderator: 'Điều hành viên',
  lawyer: 'Luật sư',
  user: 'Thành viên'
} as const;

interface OnlineUserListProps {
  userList: OnlineUser;
}

export function OnlineUserList({ userList }: OnlineUserListProps) {
  const { users, totalOnline } = userList;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Đang trực tuyến</h3>

      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.userId} className="flex items-center gap-3">
            {user.userType === 'lawyer' && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.userName[0]}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <div className="font-medium">{user.userName}</div>
              {user.userType === 'lawyer' && (
                <div
                  className={`text-sm ${roleColors[user.userType as keyof typeof roleColors]}`}
                >
                  {roleTitles[user.userType as keyof typeof roleTitles]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t text-sm text-gray-500">
        Tổng số người đang online: {totalOnline}
      </div>
    </div>
  );
}
