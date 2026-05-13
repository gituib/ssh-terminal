import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import type { TerminalData } from '../types';

export const useTerminal = () => {
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const writeRef = useRef<((data: string) => void) | null>(null);
  const listenersRef = useRef<UnlistenFn[]>([]);

  useEffect(() => {
    const setupListeners = async () => {
      const unlistenData = await listen<TerminalData>('terminal:data', (event) => {
        if (writeRef.current) {
          try {
            const decoded = atob(event.payload.data);
            writeRef.current(decoded);
          } catch {
            writeRef.current(event.payload.data);
          }
        }
      });

      const unlistenDisconnect = await listen<string>('ssh:disconnected', (event) => {
        if (event.payload === sessionId) {
          setError(t('terminal.disconnected'));
          setSessionId(null);
        }
      });

      listenersRef.current = [unlistenData, unlistenDisconnect];
    };

    setupListeners();

    return () => {
      listenersRef.current.forEach((unlisten) => unlisten());
      listenersRef.current = [];
    };
  }, [t]);

  const setWriteFn = useCallback((fn: ((data: string) => void) | null) => {
    writeRef.current = fn;
  }, []);

  const connect = useCallback(async (connectionId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const resultSessionId = await invoke<string>('ssh_connect', { id: connectionId });
      setSessionId(resultSessionId);
      return resultSessionId;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (!sessionId) return;

    try {
      await invoke('ssh_disconnect', { sessionId });
      setSessionId(null);
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
    sessionId,
    isConnecting,
    error,
    connect,
    disconnect,
    sendData,
    resize,
    setWriteFn,
  };
};
