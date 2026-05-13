import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectionSidebar } from '@/modules/connection/components/ConnectionSidebar';
import { TerminalView } from '@/modules/terminal/components/TerminalView';
import { SettingsPanel } from '@/modules/settings/components/SettingsPanel';
import type { Connection } from '@/modules/connection/types';
import styles from './App.module.css';

function App() {
  const { t } = useTranslation();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeConnectionId, setActiveConnectionId] = useState<string | undefined>(undefined);
  const [activeView, setActiveView] = useState<'terminal' | 'settings'>('terminal');

  const handleConnect = (connection: Connection) => {
    setActiveConnectionId(connection.id);
    setActiveSessionId(null);
    setActiveView('terminal');
  };

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <ConnectionSidebar onConnect={handleConnect} />
      </aside>

      <main className={styles.main}>
        <nav className={styles.nav}>
          <button
            className={`${styles.navBtn} ${activeView === 'terminal' ? styles.active : ''}`}
            onClick={() => setActiveView('terminal')}
          >
            {t('app.terminal')}
          </button>
          <button
            className={`${styles.navBtn} ${activeView === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveView('settings')}
          >
            {t('app.settings')}
          </button>
        </nav>

        <div className={styles.content}>
          {activeView === 'terminal' ? (
            <TerminalView
              sessionId={activeSessionId}
              connectionId={activeConnectionId}
              onSessionCreated={setActiveSessionId}
            />
          ) : (
            <SettingsPanel />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
