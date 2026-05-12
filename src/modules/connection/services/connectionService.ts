import { invoke } from '@tauri-apps/api/core';
import type { Connection, ConnectionInput } from '../types';

class ConnectionService {
  async getAll(): Promise<Connection[]> {
    return invoke<Connection[]>('connection_get_all');
  }

  async getById(id: string): Promise<Connection> {
    return invoke<Connection>('connection_get', { id });
  }

  async create(input: ConnectionInput): Promise<Connection> {
    return invoke<Connection>('connection_create', { connection: input });
  }

  async update(id: string, input: ConnectionInput): Promise<Connection> {
    return invoke<Connection>('connection_update', { id, connection: input });
  }

  async delete(id: string): Promise<void> {
    return invoke<void>('connection_delete', { id });
  }
}

export const connectionService = new ConnectionService();
