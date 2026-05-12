import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';
import type { TerminalData } from '../types';

export const useTerminal = (sessionId: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersRef = useRef<UnlistenFn[]>([]);

  useEffect(() => {
    if (!sessionId) {
      setIsConnected(false);
      return;
    }

    const setupListeners = async () => {
      const unlistenData = await listen<TerminalData>('terminal:data', (event) => {
        if (event.payload.sessionId === sessionId) {
          const decoded = atob(event.payload.data);
        }
      });

      const unlistenDisconnect = await listen<string>('ssh:disconnected', (event) => {
        if (event.payload === sessionId) {
          setIsConnected(false);
          setError('连接已断开');
        }
      });

      const unlistenConnected = await listen<string>('ssh:connected', (event) => {
        if (event.payload === sessionId) {
          setIsConnected(true);
        }
      });

      listenersRef.current = [unlistenData, unlistenDisconnect, unlistenConnected];
    };

    setupListeners();

    return () => {
      listenersRef.current.forEach((unlisten) => unlisten());
    };
  }, [sessionId]);

  const connect = useCallback(async (connectionId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      await invoke<string>('ssh_connect', { id: connectionId });
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!sessionId) return;

    try {
      await invoke('ssh_disconnect', { sessionId });
      setIsConnected(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '断开连接失败');
    }
  }, [sessionId]);

  const sendData = useCallback(async (data: string) => {
    if (!sessionId) return;

    try {
      const encoded = btoa(data);
      await invoke('ssh_send_data', { sessionId, data: encoded });
    } catch (err) {
      console.error('Send data error:', err);
    }
  }, [sessionId]);

  return {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendData,
  };
};
