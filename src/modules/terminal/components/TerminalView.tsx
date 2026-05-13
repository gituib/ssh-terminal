import { FC, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, TerminalHandle } from '../xterm/Terminal';
import { useTerminal } from '../hooks/useTerminal';
import styles from './TerminalView.module.css';

interface TerminalViewProps {
  sessionId: string | null;
  connectionId?: string;
}

export const TerminalView: FC<TerminalViewProps> = ({ sessionId, connectionId }) => {
  const { t } = useTranslation();
  const terminalRef = useRef<TerminalHandle>(null);
  const { isConnecting, error, disconnect, sendData, connect } = useTerminal(sessionId);

  useEffect(() => {
    if (connectionId && !sessionId) {
      connect(connectionId);
    }
  }, [connectionId, sessionId, connect]);

  const handleData = useCallback((data: string) => {
    sendData(data);
  }, [sendData]);

  const handleDisconnect = () => {
    disconnect();
  };

  if (!sessionId && !connectionId) {
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

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={handleDisconnect}>{t('terminal.retry')}</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Terminal ref={terminalRef} onData={handleData} />
    </div>
  );
};
