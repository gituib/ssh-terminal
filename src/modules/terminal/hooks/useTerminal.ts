import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';
import type { TerminalData } from '../types';

export const useTerminal = (sessionId: string | null) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersRef = useRef<UnlistenFn[]>([]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const setupListeners = async () => {
      const unlistenData = await listen<TerminalData>('terminal:data', () => {
        // 后续可以扩展处理终端数据
      });

      const unlistenDisconnect = await listen<string>('ssh:disconnected', (event) => {
        if (event.payload === sessionId) {
          setError('连接已断开');
        }
      });

      const unlistenConnected = await listen<string>('ssh:connected', () => {
        // 连接成功事件
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
    isConnecting,
    error,
    connect,
    disconnect,
    sendData,
  };
};
