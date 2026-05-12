import { FC } from 'react';
import { useSettings } from '../hooks/useSettings';
import styles from './SettingsPanel.module.css';

export const SettingsPanel: FC = () => {
  const { settings, updateSettings } = useSettings();

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      ...settings,
      fontSize: parseInt(e.target.value),
    });
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({
      ...settings,
      theme: e.target.value as 'dark' | 'light',
    });
  };

  const handleScrollbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      ...settings,
      scrollback: parseInt(e.target.value),
    });
  };

  return (
    <div className={styles.panel}>
      <h2>设置</h2>

      <div className={styles.section}>
        <h3>终端</h3>

        <div className={styles.field}>
          <label>字体大小</label>
          <div className={styles.range}>
            <input
              type="range"
              min="10"
              max="24"
              value={settings.fontSize}
              onChange={handleFontSizeChange}
            />
            <span>{settings.fontSize}px</span>
          </div>
        </div>

        <div className={styles.field}>
          <label>滚动行数</label>
          <div className={styles.range}>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={settings.scrollback}
              onChange={handleScrollbackChange}
            />
            <span>{settings.scrollback}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3>外观</h3>

        <div className={styles.field}>
          <label>主题</label>
          <select value={settings.theme} onChange={handleThemeChange}>
            <option value="dark">深色</option>
            <option value="light">浅色</option>
          </select>
        </div>
      </div>
    </div>
  );
};
