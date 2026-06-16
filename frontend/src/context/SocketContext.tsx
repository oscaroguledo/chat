import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

export interface WsMessage {
  type: string;
  payload?: unknown;
  userId?: string;
  chatId?: string;
  typing?: boolean;
  status?: string;
}

type Listener = (msg: WsMessage) => void;

interface SocketContextType {
  connected: boolean;
  subscribe: (destination: string, listener: Listener) => () => void;
  publish: (destination: string, body: object) => void;
}

const SocketContext = createContext<SocketContextType>({
  connected: false,
  subscribe: () => () => {},
  publish: () => {},
});

const WS_URL = (import.meta.env.VITE_WS_URL as string) || '';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const listenersRef = useRef<Map<string, Set<Listener>>>(new Map());
  const stompSubsRef = useRef<Map<string, ReturnType<Client['subscribe']>>>(new Map());

  useEffect(() => {
    if (!token) {
      clientRef.current?.deactivate();
      setConnected(false);
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        // Re-subscribe all pending listeners after reconnect
        listenersRef.current.forEach((_, dest) => {
          if (!stompSubsRef.current.has(dest)) {
            const sub = client.subscribe(dest, (msg: IMessage) => {
              try {
                const parsed: WsMessage = JSON.parse(msg.body);
                listenersRef.current.get(dest)?.forEach(fn => fn(parsed));
              } catch { /* ignore malformed */ }
            });
            stompSubsRef.current.set(dest, sub);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
        stompSubsRef.current.clear();
      },
      onStompError: frame => console.warn('STOMP error', frame.headers?.message),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      stompSubsRef.current.clear();
    };
  }, [token]);

  const subscribe = (destination: string, listener: Listener): (() => void) => {
    if (!listenersRef.current.has(destination)) {
      listenersRef.current.set(destination, new Set());
    }
    listenersRef.current.get(destination)!.add(listener);

    const client = clientRef.current;
    if (client?.connected && !stompSubsRef.current.has(destination)) {
      const sub = client.subscribe(destination, (msg: IMessage) => {
        try {
          const parsed: WsMessage = JSON.parse(msg.body);
          listenersRef.current.get(destination)?.forEach(fn => fn(parsed));
        } catch { /* ignore */ }
      });
      stompSubsRef.current.set(destination, sub);
    }

    return () => {
      listenersRef.current.get(destination)?.delete(listener);
      if (listenersRef.current.get(destination)?.size === 0) {
        listenersRef.current.delete(destination);
        stompSubsRef.current.get(destination)?.unsubscribe();
        stompSubsRef.current.delete(destination);
      }
    };
  };

  const publish = (destination: string, body: object) => {
    clientRef.current?.publish({ destination, body: JSON.stringify(body) });
  };

  return (
    <SocketContext.Provider value={{ connected, subscribe, publish }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextType {
  return useContext(SocketContext);
}
