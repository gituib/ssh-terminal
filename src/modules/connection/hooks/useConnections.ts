import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connectionService } from '../services/connectionService';
import type { Connection, ConnectionInput } from '../types';

export const useConnections = () => {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await connectionService.getAll();
      setConnections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('connection.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const createConnection = useCallback(async (input: ConnectionInput) => {
    await connectionService.create(input);
    await fetchConnections();
  }, [fetchConnections]);

  const updateConnection = useCallback(async (id: string, input: ConnectionInput) => {
    await connectionService.update(id, input);
    await fetchConnections();
  }, [fetchConnections]);

  const deleteConnection = useCallback(async (id: string) => {
    await connectionService.delete(id);
    await fetchConnections();
  }, [fetchConnections]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return {
    connections,
    isLoading,
    error,
    fetchConnections,
    createConnection,
    updateConnection,
    deleteConnection,
  };
};
