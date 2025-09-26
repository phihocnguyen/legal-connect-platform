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

export function useSyncWebSocket(url: string, onMessage?: (msg: IMessage) => void) {
  const store = useWebSocketStore.getState();

  const {
    connected,
    client,
    connect,
    disconnect,
    getOnlineUsers,
    subscribe,
    send,
  } = useSockJsStomp({ url, onMessage });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    useWebSocketStore.setState({
      connect,
      disconnect,
      getOnlineUsers,
      subscribe,
      send,
    });
  }, [connect, disconnect, getOnlineUsers, subscribe, send]);

  useEffect(() => {
    store.setConnected(connected);
  }, [connected, store]);

  useEffect(() => {
    store.setClient(client);
  }, [client, store]);
}
