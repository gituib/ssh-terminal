import { FC, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Terminal, TerminalHandle } from '../xterm/Terminal';
import { useTerminal } from '../hooks/useTerminal';
import styles from './TerminalView.module.css';

interface TerminalViewProps {
  sessionId: string | null;
  connectionId?: string;
  onSessionCreated?: (sessionId: string) => void;
}

export const TerminalView: FC<TerminalViewProps> = ({
  sessionId,
  connectionId,
  onSessionCreated,
}) => {
  const { t } = useTranslation();
  const terminalRef = useRef<TerminalHandle>(null);

  const handleTerminalData = useCallback((data: string) => {
    terminalRef.current?.write(data);
  }, []);

  const { isConnecting, error, disconnect, sendData, connect } = useTerminal(
    sessionId,
    handleTerminalData,
  );

  useEffect(() => {
    if (connectionId && !sessionId) {
      connect(connectionId).then((resultSessionId) => {
        if (resultSessionId && onSessionCreated) {
          onSessionCreated(resultSessionId);
        }
      });
    }
  }, [connectionId, sessionId, connect, onSessionCreated]);

  const handleData = useCallback(
    (data: string) => {
      sendData(data);
    },
    [sendData],
  );

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

  if (!sessionId) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Terminal ref={terminalRef} onData={handleData} />
    </div>
  );
};
