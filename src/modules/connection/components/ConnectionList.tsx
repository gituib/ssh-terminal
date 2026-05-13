import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectionItem } from './ConnectionItem';
import type { Connection } from '../types';
import styles from './ConnectionList.module.css';

interface ConnectionListProps {
  connections: Connection[];
  isLoading: boolean;
  error: string | null;
  onConnect: (connection: Connection) => void;
  onEdit: (connection: Connection) => void;
  onDelete: (id: string) => void;
}

export const ConnectionList: FC<ConnectionListProps> = ({
  connections,
  isLoading,
  error,
  onConnect,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>{t('connection.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{t('connection.empty')}</p>
        <p className={styles.hint}>{t('connection.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {connections.map((connection) => (
        <ConnectionItem
          key={connection.id}
          connection={connection}
          onConnect={onConnect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
