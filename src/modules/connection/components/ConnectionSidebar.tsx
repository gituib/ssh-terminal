import { FC, useState } from 'react';
import { ConnectionList } from './ConnectionList';
import { ConnectionForm } from './ConnectionForm';
import { Modal } from '@/shared/components/Modal';
import { useConnections } from '../hooks/useConnections';
import type { Connection, ConnectionInput } from '../types';
import styles from './ConnectionSidebar.module.css';

interface ConnectionSidebarProps {
  onConnect: (connection: Connection) => void;
}

export const ConnectionSidebar: FC<ConnectionSidebarProps> = ({ onConnect }) => {
  const {
    connections,
    isLoading,
    error,
    createConnection,
    updateConnection,
    deleteConnection,
  } = useConnections();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);

  const handleCreate = () => {
    setEditingConnection(null);
    setIsFormOpen(true);
  };

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    setIsFormOpen(true);
  };

  const handleSubmit = async (input: ConnectionInput) => {
    if (editingConnection) {
      await updateConnection(editingConnection.id, input);
    } else {
      await createConnection(input);
    }
    setIsFormOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个连接吗？')) {
      await deleteConnection(id);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2>连接</h2>
        <button className={styles.addBtn} onClick={handleCreate}>
          + 新建
        </button>
      </div>

      <ConnectionList
        connections={connections}
        isLoading={isLoading}
        error={error}
        onConnect={onConnect}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <ConnectionForm
          connection={editingConnection || undefined}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};
