import { FC } from 'react';
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
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p>加载中...</p>
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
        <p>暂无连接</p>
        <p className={styles.hint}>点击上方"新建"添加服务器连接</p>
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
