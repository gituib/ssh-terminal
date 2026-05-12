import { FC, useState } from 'react';
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
        <label>名称</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="我的服务器"
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>主机</label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="192.168.1.100"
            required
          />
        </div>
        <div className={styles.field} style={{ width: '100px' }}>
          <label>端口</label>
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
        <label>用户名</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="root"
          required
        />
      </div>

      <div className={styles.field}>
        <label>认证方式</label>
        <select
          value={authType}
          onChange={(e) => setAuthType(e.target.value as AuthType)}
        >
          <option value="password">密码</option>
          <option value="key">密钥文件</option>
        </select>
      </div>

      {authType === 'password' ? (
        <div className={styles.field}>
          <label>密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={connection ? '(不修改请留空)' : '输入密码'}
          />
        </div>
      ) : (
        <div className={styles.field}>
          <label>密钥文件路径</label>
          <input
            type="text"
            value={keyPath}
            onChange={(e) => setKeyPath(e.target.value)}
            placeholder="C:\\Users\\.ssh\\id_rsa"
            required
          />
        </div>
      )}

      <div className={styles.field}>
        <label>分组 (可选)</label>
        <input
          type="text"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          placeholder="生产环境"
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className={styles.submitBtn}>
          {connection ? '保存' : '创建'}
        </button>
      </div>
    </form>
  );
};
