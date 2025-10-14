// 📁 src/stores/web-socket-store.ts
import { create } from 'zustand';
import { Client, IMessage, StompHeaders, StompSubscription } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import useSockJsStomp, { UseSockJsStompResult } from '@/hooks/use-websocket-cases';

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

interface WebSocketStore {
  connected: boolean;
  client: UseSockJsStompResult['client'];
  connect: () => void;
  disconnect: () => void;
  getOnlineUsers: () => Promise<OnlineUser>;
  subscribe: (
    destination: string,
    callback: (message: IMessage) => void,
    headers?: StompHeaders
  ) => StompSubscription | null;
  send: (
    destination: string,
    body: string,
    headers?: StompHeaders
  ) => void;
  setConnected: (connected: boolean) => void;
  setClient: (client: UseSockJsStompResult['client']) => void;
}

export const useWebSocketStore = create<WebSocketStore>((set) => ({
  connected: false,
  client: null,
  connect: () => {},
  disconnect: () => {},
  getOnlineUsers: async () => ({ users: [], lawyers: [], totalOnline: 0 }),
  subscribe: () => null,
  send: () => {},
  setConnected: (connected: boolean) => set({ connected }),
  setClient: (client: Client | null) => set({ client }),
}));



export function useSyncWebSocket(
  url: string,
  onMessage?: (msg: IMessage) => void,
  headers?: StompHeaders
) {
  const hasInitialized = useRef(false);
  const lastUrl = useRef<string>('');
  const lastOnMessage = useRef<((msg: IMessage) => void) | undefined>(undefined);
  const lastHeaders = useRef<StompHeaders | undefined>(undefined);

  const {
    connected,
    client,
    connect,
    disconnect,
    getOnlineUsers,
    subscribe,
    send,
  } = useSockJsStomp({
    url,
    onMessage,
    headers: headers || {},
  });

  useEffect(() => {
    // Chỉ khởi tạo một lần hoặc khi có thay đổi quan trọng
    const hasUrlChanged = lastUrl.current !== url;
    const hasOnMessageChanged = lastOnMessage.current !== onMessage;
    const hasHeadersChanged = JSON.stringify(lastHeaders.current || {}) !== JSON.stringify(headers || {});
    if (!hasInitialized.current || hasUrlChanged || hasOnMessageChanged || hasHeadersChanged) {
      console.log('Initializing WebSocket store - URL:', url, 'Changed:', { hasUrlChanged, hasOnMessageChanged, hasHeadersChanged });
      hasInitialized.current = true;
      lastUrl.current = url;
      lastOnMessage.current = onMessage;
      lastHeaders.current = headers;
      useWebSocketStore.setState({
        connect,
        disconnect,
        getOnlineUsers,
        subscribe,
        send,
      });
    }
  }, [connect, disconnect, getOnlineUsers, subscribe, send, url, onMessage, headers]);

  useEffect(() => {
    useWebSocketStore.getState().setConnected(connected);
  }, [connected]);

  useEffect(() => {
    useWebSocketStore.getState().setClient(client);
  }, [client]);
}
