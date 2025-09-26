import {create} from 'zustand';

type User =  {
  userId: string;
  userName: string;
  userType: string;
  avatar: string;
  online: boolean;
  lastSeen: string;
  sessionId: string
}

interface OnlineUser {
  users: User[];
  lawyers: User[];
  totalOnline: number
}

interface OnlineUserStore {
    onlineUsers: OnlineUser
    loading: boolean;
    error: string | null;
    fetchOnlineUsers: (getter : () => Promise<OnlineUser>) => Promise<void>;
}

const useOnlineUserStore = create<OnlineUserStore>((set) => ({
    onlineUsers: { users: [], lawyers: [], totalOnline: 0 },
    loading: false,
    error: null,
    fetchOnlineUsers: async (getter) => {
        set({ loading: true, error: null });
        try {
            const users = await getter();
            set({ onlineUsers: users, loading: false });
        } catch (error: unknown) {
            set({ error: (error as Error).message, loading: false });
        }
    },
}));

export default useOnlineUserStore;