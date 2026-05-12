export interface SshSession {
  id: string;
  connectionId: string;
  status: SessionStatus;
  connectedAt?: string;
}

export type SessionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface TerminalData {
  sessionId: string;
  data: string;
}
