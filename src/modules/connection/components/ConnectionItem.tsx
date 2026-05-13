import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Connection } from '../types';
import styles from './ConnectionItem.module.css';

interface ConnectionItemProps {
  connection: Connection;
  onConnect: (connection: Connection) => void;
  onEdit: (connection: Connection) => void;
  onDelete: (id: string) => void;
}

export const ConnectionItem: FC<ConnectionItemProps> = ({
  connection,
  onConnect,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.item}>
      <div className={styles.info} onClick={() => onConnect(connection)}>
        <span className={styles.name}>{connection.name}</span>
        <span className={styles.host}>
          {connection.username}@{connection.host}:{connection.port}
        </span>
      </div>
      <div className={styles.actions}>
        <button
          className={styles.connectBtn}
          onClick={() => onConnect(connection)}
        >
          {t('connection.connect')}
        </button>
        <button
          className={styles.editBtn}
          onClick={() => onEdit(connection)}
        >
          {t('connection.edit')}
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(connection.id)}
        >
          {t('connection.delete')}
        </button>
      </div>
    </div>
  );
};
