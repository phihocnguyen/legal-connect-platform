import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'lawyer' | 'user';
  lastActive: string;
}

const roleColors = {
  admin: 'text-red-600',
  moderator: 'text-blue-600',
  lawyer: 'text-green-600',
  user: 'text-gray-600'
};

const roleTitles = {
  admin: 'Quản trị viên',
  moderator: 'Điều hành viên',
  lawyer: 'Luật sư',
  user: 'Thành viên'
};

interface OnlineUserListProps {
  users: OnlineUser[];
}

export function OnlineUserList({ users }: OnlineUserListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Đang trực tuyến</h3>
      <div className="space-y-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className={`text-sm ${roleColors[user.role]}`}>
                {roleTitles[user.role]}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t text-sm text-gray-500">
        Tổng số người đang online: {users.length}
      </div>
    </div>
  );
}
