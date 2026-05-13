import { FC, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, TerminalHandle } from '../xterm/Terminal';
import { useTerminal } from '../hooks/useTerminal';
import styles from './TerminalView.module.css';

interface TerminalViewProps {
  connectionId?: string;
}

export const TerminalView: FC<TerminalViewProps> = ({ connectionId }) => {
  const { t } = useTranslation();
  const terminalRef = useRef<TerminalHandle>(null);
  const {
    sessionId,
    isConnecting,
    error,
    connect,
    disconnect,
    sendData,
    setWriteFn,
  } = useTerminal();

  const handleWrite = useCallback((data: string) => {
    terminalRef.current?.write(data);
  }, []);

  useEffect(() => {
    setWriteFn(handleWrite);
  }, [handleWrite, setWriteFn]);

  useEffect(() => {
    if (connectionId && !sessionId && !isConnecting) {
      connect(connectionId);
    }
  }, [connectionId, sessionId, isConnecting, connect]);

  const handleData = useCallback(
    (data: string) => {
      sendData(data);
    },
    [sendData],
  );

  if (!connectionId) {
    return (
      <div className={styles.placeholder}>
        <p>{t('terminal.selectConnection')}</p>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className={styles.placeholder}>
        <p>{t('terminal.connecting')}</p>
      </div>
    );
  }

  if (error && !sessionId) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => connect(connectionId)}>{t('terminal.retry')}</button>
      </div>
    );
  }

  if (!sessionId) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Terminal ref={terminalRef} onData={handleData} />
    </div>
  );
};
