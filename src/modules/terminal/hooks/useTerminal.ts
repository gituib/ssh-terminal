import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';
import type { TerminalData } from '../types';

export const useTerminal = (sessionId: string | null) => {
  const { t } = useTranslation();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listenersRef = useRef<UnlistenFn[]>([]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const setupListeners = async () => {
      const unlistenData = await listen<TerminalData>('terminal:data', () => {
      });

      const unlistenDisconnect = await listen<string>('ssh:disconnected', (event) => {
        if (event.payload === sessionId) {
          setError(t('terminal.disconnected'));
        }
      });

      const unlistenConnected = await listen<string>('ssh:connected', () => {
      });

      listenersRef.current = [unlistenData, unlistenDisconnect, unlistenConnected];
    };

    setupListeners();

    return () => {
      listenersRef.current.forEach((unlisten) => unlisten());
    };
  }, [sessionId, t]);

  const connect = useCallback(async (connectionId: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      await invoke<string>('ssh_connect', { id: connectionId });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('terminal.connectFailed'));
    } finally {
      setIsConnecting(false);
    }
  }, [t]);

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

  return {
    isConnecting,
    error,
    connect,
    disconnect,
    sendData,
  };
};
