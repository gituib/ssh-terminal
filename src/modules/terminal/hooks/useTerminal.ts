import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import type { TerminalData } from '../types';

export const useTerminal = (
  sessionId: string | null,
  onTerminalData?: (data: string) => void,
) => {
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersRef = useRef<UnlistenFn[]>([]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const setupListeners = async () => {
      const unlistenData = await listen<TerminalData>('terminal:data', (event) => {
        if (event.payload.sessionId === sessionId && onTerminalData) {
          try {
            const decoded = atob(event.payload.data);
            onTerminalData(decoded);
          } catch {
            onTerminalData(event.payload.data);
          }
        }
      });

      const unlistenDisconnect = await listen<string>('ssh:disconnected', (event) => {
        if (event.payload === sessionId) {
          setError(t('terminal.disconnected'));
        }
      });

      listenersRef.current = [unlistenData, unlistenDisconnect];
    };

    setupListeners();

    return () => {
      listenersRef.current.forEach((unlisten) => unlisten());
      listenersRef.current = [];
    };
  }, [sessionId, onTerminalData, t]);

  const connect = useCallback(async (connectionId: string): Promise<string | null> => {
    setIsConnecting(true);
    setError(null);

    try {
      const resultSessionId = await invoke<string>('ssh_connect', { id: connectionId });
      return resultSessionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!sessionId) return;

    try {
      await invoke('ssh_disconnect', { sessionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('terminal.disconnectFailed'));
    }
  }, [sessionId, t]);

  const sendData = useCallback(async (data: string) => {
    if (!sessionId) return;

    try {
      const encoded = btoa(data);
      await invoke('ssh_send_data', { sessionId, data: encoded });
    } catch (err) {
      console.error('Send data error:', err);
    }
  }, [sessionId]);

  const resize = useCallback(async (cols: number, rows: number) => {
    if (!sessionId) return;

    try {
      await invoke('ssh_resize', { sessionId, cols, rows });
    } catch (err) {
      console.error('Resize error:', err);
    }
  }, [sessionId]);

  return {
    isConnecting,
    error,
    connect,
    disconnect,
    sendData,
    resize,
  };
};
