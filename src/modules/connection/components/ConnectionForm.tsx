import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Connection, ConnectionInput, AuthType } from '../types';
import styles from './ConnectionForm.module.css';

interface ConnectionFormProps {
  connection?: Connection;
  onSubmit: (input: ConnectionInput) => void;
  onCancel: () => void;
}

export const ConnectionForm: FC<ConnectionFormProps> = ({
  connection,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(connection?.name || '');
  const [host, setHost] = useState(connection?.host || '');
  const [port, setPort] = useState(connection?.port || 22);
  const [username, setUsername] = useState(connection?.username || '');
  const [authType, setAuthType] = useState<AuthType>(connection?.authType || 'password');
  const [password, setPassword] = useState('');
  const [keyPath, setKeyPath] = useState(connection?.keyPath || '');
  const [group, setGroup] = useState(connection?.group || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      host,
      port,
      username,
      authType,
      password: authType === 'password' ? password : undefined,
      keyPath: authType === 'key' ? keyPath : undefined,
      group: group || undefined,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label>{t('connectionForm.name')}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('connectionForm.namePlaceholder')}
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>{t('connectionForm.host')}</label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder={t('connectionForm.hostPlaceholder')}
            required
          />
        </div>
        <div className={styles.field} style={{ width: '100px' }}>
          <label>{t('connectionForm.port')}</label>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(parseInt(e.target.value))}
            min={1}
            max={65535}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label>{t('connectionForm.username')}</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('connectionForm.usernamePlaceholder')}
          required
        />
      </div>

      <div className={styles.field}>
        <label>{t('connectionForm.authType')}</label>
        <select
          value={authType}
          onChange={(e) => setAuthType(e.target.value as AuthType)}
        >
          <option value="password">{t('connectionForm.authPassword')}</option>
          <option value="key">{t('connectionForm.authKey')}</option>
        </select>
      </div>

      {authType === 'password' ? (
        <div className={styles.field}>
          <label>{t('connectionForm.password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={connection ? t('connectionForm.passwordEditPlaceholder') : t('connectionForm.passwordPlaceholder')}
          />
        </div>
      ) : (
        <div className={styles.field}>
          <label>{t('connectionForm.keyPath')}</label>
          <input
            type="text"
            value={keyPath}
            onChange={(e) => setKeyPath(e.target.value)}
            placeholder={t('connectionForm.keyPathPlaceholder')}
            required
          />
        </div>
      )}

      <div className={styles.field}>
        <label>{t('connectionForm.group')}</label>
        <input
          type="text"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder={t('connectionForm.groupPlaceholder')}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          {t('connectionForm.cancel')}
        </button>
        <button type="submit" className={styles.submitBtn}>
          {connection ? t('connectionForm.save') : t('connectionForm.create')}
        </button>
      </div>
    </form>
  );
};
