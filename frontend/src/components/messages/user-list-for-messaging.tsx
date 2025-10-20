'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, User, Shield, Scale } from 'lucide-react';
import { StartConversationButton } from './start-conversation-button';
import type { User as UserType } from '@/domain/entities';

interface UserListForMessagingProps {
  currentUserId: number;
}

// Mock users data - in real app this would come from API
const mockUsers: UserType[] = [
  {
    id: 2,
    email: 'lawyer1@example.com',
    fullName: 'John Doe',
    avatar: 'https://via.placeholder.com/40',
    role: 'LAWYER',
    lawyerLicenseNumber: 'L123456',
    lawyerVerified: true,
  },
  {
    id: 3,
    email: 'user1@example.com',
    fullName: 'Jane Smith',
    avatar: 'https://via.placeholder.com/40',
    role: 'USER',
    lawyerVerified: false,
  },
  {
    id: 4,
    email: 'lawyer2@example.com',
    fullName: 'Mike Johnson',
    avatar: 'https://via.placeholder.com/40',
    role: 'LAWYER',
    lawyerLicenseNumber: 'L789012',
    lawyerVerified: true,
  },
  {
    id: 5,
    email: 'user2@example.com',
    fullName: 'Sarah Wilson',
    avatar: 'https://via.placeholder.com/40',
    role: 'USER',
    lawyerVerified: false,
  }
];

export function UserListForMessaging({ currentUserId }: UserListForMessagingProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch users
    const fetchUsers = async () => {
      setLoading(true);
      
      // Filter out current user and simulate delay
      setTimeout(() => {
        const filteredUsers = mockUsers.filter(user => user.id !== currentUserId);
        setUsers(filteredUsers);
        setLoading(false);
      }, 500);
      
      // In real app:
      // try {
      //   const response = await apiClient.get('/api/users/available-for-messaging');
      //   setUsers(response.data.filter(user => user.id !== currentUserId));
      // } catch (error) {
      //   console.error('Error fetching users:', error);
      // } finally {
      //   setLoading(false);
      // }
    };

    fetchUsers();
  }, [currentUserId]);

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'lawyer':
        return <Scale className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (user: UserType) => {
    if (user.role === 'LAWYER' && user.lawyerVerified) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Verified Lawyer</Badge>;
    }
    if (user.role === 'LAWYER') {
      return <Badge variant="outline">Lawyer</Badge>;
    }
    if (user.role === 'ADMIN') {
      return <Badge variant="default">Admin</Badge>;
    }
    return <Badge variant="outline">User</Badge>;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Start New Conversation
        </CardTitle>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {/* Avatar */}
                <div className="relative">
                  {user.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.fullName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                  )}
                  {user.role === 'LAWYER' && user.lawyerVerified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Scale className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{user.fullName}</p>
                    {getRoleBadge(user)}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  {user.role === 'LAWYER' && user.lawyerLicenseNumber && (
                    <p className="text-xs text-blue-600">License: {user.lawyerLicenseNumber}</p>
                  )}
                </div>

                {/* Start conversation button */}
                <StartConversationButton
                  currentUserId={currentUserId}
                  targetUserId={user.id}
                  targetUserName={user.fullName}
                  variant="outline"
                  className="text-xs px-3 py-1 h-8"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Usage:
// <UserListForMessaging currentUserId={1} />