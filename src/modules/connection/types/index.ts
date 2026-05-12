export interface Connection {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: AuthType;
  password?: string;
  keyPath?: string;
  group?: string;
}

export type AuthType = 'password' | 'key';

export interface ConnectionInput {
  name: string;
  host: string;
  port: number;
  username: string;
  authType: AuthType;
  password?: string;
  keyPath?: string;
  group?: string;
}
