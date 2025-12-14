"use client";

import { useEffect } from "react";
import { useWebSocketStore, useSyncWebSocket } from "@/stores/web-socket-store";
import { useAuth } from "@/contexts/auth-context";

export default function WebSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  useSyncWebSocket(
    process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080/ws"
  );

  const connected = useWebSocketStore((s) => s.connected);
  const connect = useWebSocketStore((s) => s.connect);
  const disconnect = useWebSocketStore((s) => s.disconnect);

  useEffect(() => {
    if (user && !connected) {
      connect();
    }
  }, [user, connected, connect]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return <>{children}</>;
}
