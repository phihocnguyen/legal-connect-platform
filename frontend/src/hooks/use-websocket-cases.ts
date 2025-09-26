import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import {
  Client,
  IMessage,
  StompSubscription,
  StompHeaders,
  Frame,
} from '@stomp/stompjs';

interface UseSockJsStompOptions {
  url: string;
  onMessage?: (message: IMessage) => void;
  headers?: StompHeaders;
  reconnectDelay?: number;
}

interface UseSockJsStompResult {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
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
  client: Client | null;
}

export default function useSockJsStomp({
  url,
  onMessage,
  headers = {},
  reconnectDelay = 5000,
}: UseSockJsStompOptions): UseSockJsStompResult {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (clientRef.current?.connected) return;

    const socket = new SockJS(url, null, {
      withCredentials: true,
    });

    const client = new Client({
      webSocketFactory: () => socket,
      debug: () => {
      },
      reconnectDelay: 0,
      connectHeaders: headers,
      onConnect: () => {
        setConnected(true);
        if (onMessage) {
          client.subscribe('/topic/default', onMessage);
        }
      },
      onStompError: (frame: Frame) => {
        console.error('[STOMP error]', frame);
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onWebSocketClose: () => {
        setConnected(false);
        if (!reconnectTimer.current) {
          reconnectTimer.current = setTimeout(() => {
            reconnectTimer.current = null;
            connect();
          }, reconnectDelay);
        }
      },
    });

    client.activate();
    clientRef.current = client;
  }, [url, headers, reconnectDelay, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    const client = clientRef.current;
    if (client) {
      try {
        client.deactivate();
      } catch (e) {
        console.warn('Failed to deactivate STOMP client:', e);
      }
      clientRef.current = null;
    }
    setConnected(false);
  }, []);

  const subscribe = useCallback(
    (
      destination: string,
      callback: (message: IMessage) => void,
      subHeaders: StompHeaders = {}
    ): StompSubscription | null => {
      const client = clientRef.current;
      if (!client || !client.connected) {
        console.warn('STOMP not connected. Cannot subscribe to', destination);
        return null;
      }
      return client.subscribe(destination, callback, subHeaders);
    },
    []
  );
  const send = useCallback(
    (destination: string, body: string, sendHeaders: StompHeaders = {}) => {
      const client = clientRef.current;
      if (!client || !client.connected) {
        console.warn('STOMP not connected. Cannot send to', destination);
        return;
      }
      client.publish({ destination, body, headers: sendHeaders });
    },
    []
  );
  useEffect(() => {
    if (onMessage) {
      connect();
    }

    return () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [connect, onMessage]);
  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return {
    connected,
    connect,
    disconnect,
    subscribe,
    send,
    client: clientRef.current,
  };
}
