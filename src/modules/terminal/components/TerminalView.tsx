import { FC, useRef, useCallback, useEffect } from 'react';
import { Terminal, TerminalHandle } from '../xterm/Terminal';
import { useTerminal } from '../hooks/useTerminal';
import styles from './TerminalView.module.css';

interface TerminalViewProps {
  sessionId: string | null;
  connectionId?: string;
}

export const TerminalView: FC<TerminalViewProps> = ({ sessionId, connectionId }) => {
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
        <p>选择一个连接以开始</p>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className={styles.placeholder}>
        <p>正在连接...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={handleDisconnect}>重试</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Terminal ref={terminalRef} onData={handleData} />
    </div>
  );
};
