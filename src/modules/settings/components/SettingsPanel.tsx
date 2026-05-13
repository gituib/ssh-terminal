import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';
import styles from './SettingsPanel.module.css';

export const SettingsPanel: FC = () => {
  const { t, i18n } = useTranslation();
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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className={styles.panel}>
      <h2>{t('settings.title')}</h2>

      <div className={styles.section}>
        <h3>{t('settings.terminal')}</h3>

        <div className={styles.field}>
          <label>{t('settings.fontSize')}</label>
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
          <label>{t('settings.scrollback')}</label>
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
        <h3>{t('settings.appearance')}</h3>

        <div className={styles.field}>
          <label>{t('settings.theme')}</label>
          <select value={settings.theme} onChange={handleThemeChange}>
            <option value="dark">{t('settings.themeDark')}</option>
            <option value="light">{t('settings.themeLight')}</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>{t('settings.language')}</label>
          <select value={i18n.language} onChange={handleLanguageChange}>
            <option value="zh">{t('settings.languageZh')}</option>
            <option value="en">{t('settings.languageEn')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
