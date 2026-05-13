use crate::error::{AppError, Result};
use crate::modules::connection::{AuthType, Connection};
use crate::infrastructure::crypto::DpapiCrypto;
use crate::modules::ssh::handler::SshHandler;
use russh::client;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use tauri::AppHandle;

pub struct SshSessionManager {
    sessions: Arc<RwLock<HashMap<String, client::Handle<SshHandler>>>>,
    channels: Arc<RwLock<HashMap<String, russh::Channel<russh::client::Msg>>>>,
}

impl SshSessionManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            channels: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn connect(&self, app: AppHandle, connection: &Connection) -> Result<String> {
        let session_id = Uuid::new_v4().to_string();

        let config = client::Config {
            inactivity_timeout: Some(std::time::Duration::from_secs(60)),
            ..Default::default()
        };

        let (handler, _channel_rx) = SshHandler::new(session_id.clone(), app);

        let mut handle = client::connect(
            Arc::new(config),
            (connection.host.as_str(), connection.port),
            handler,
        )
        .await
        .map_err(|e| AppError::SshConnectionFailed(e.to_string()))?;

        let auth_ok = match connection.auth_type {
            AuthType::Password => {
                if let Some(ref encrypted_pwd) = connection.password {
                    let crypto = DpapiCrypto::new();
                    let password = crypto.decrypt_base64(encrypted_pwd)?;
                    handle
                        .authenticate_password(&connection.username, &password)
                        .await
                        .map_err(|e| AppError::SshConnectionFailed(e.to_string()))?
                } else {
                    return Err(AppError::InvalidCredentials);
                }
            }
            AuthType::Key => {
                if let Some(ref key_path) = connection.key_path {
                    let key_content = std::fs::read_to_string(key_path)
                        .map_err(|e| AppError::CryptoError(e.to_string()))?;
                    let key_pair = russh_keys::decode_secret_key(&key_content, None)
                        .map_err(|e| AppError::CryptoError(e.to_string()))?;
                    handle
                        .authenticate_publickey(&connection.username, Arc::new(key_pair))
                        .await
                        .map_err(|e| AppError::SshConnectionFailed(e.to_string()))?
                } else {
                    return Err(AppError::InvalidCredentials);
                }
            }
        };

        if !auth_ok {
            return Err(AppError::InvalidCredentials);
        }

        let channel = handle
            .channel_open_session()
            .await
            .map_err(|e| AppError::SshConnectionFailed(e.to_string()))?;

        channel
            .request_pty(
                false,
                "xterm-256color",
                80,
                24,
                0,
                0,
                &[],
            )
            .await
            .map_err(|e| AppError::SshConnectionFailed(e.to_string()))?;

        channel
            .request_shell(true)
            .await
            .map_err(|e| AppError::SshConnectionFailed(e.to_string()))?;

        self.sessions.write().await.insert(session_id.clone(), handle);
        self.channels.write().await.insert(session_id.clone(), channel);

        Ok(session_id)
    }

    pub async fn disconnect(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        let mut channels = self.channels.write().await;
        if let Some(_handle) = sessions.remove(session_id) {
            channels.remove(session_id);
            tracing::info!("Disconnected session: {}", session_id);
        }
        Ok(())
    }

    pub async fn write(&self, session_id: &str, data: &[u8]) -> Result<()> {
        let channels = self.channels.read().await;
        let channel = channels
            .get(session_id)
            .ok_or_else(|| AppError::SshConnectionFailed("Session not found".to_string()))?;

        channel
            .data(std::io::Cursor::new(data))
            .await
            .map_err(|e| AppError::SshConnectionFailed(e.to_string()))?;

        Ok(())
    }

    pub async fn resize(&self, session_id: &str, cols: u32, rows: u32) -> Result<()> {
        let channels = self.channels.read().await;
        let channel = channels
            .get(session_id)
            .ok_or_else(|| AppError::SshConnectionFailed("Session not found".to_string()))?;

        channel
            .window_change(cols, rows, 0, 0)
            .await
            .map_err(|e| AppError::SshConnectionFailed(e.to_string()))?;

        Ok(())
    }
}

impl Default for SshSessionManager {
    fn default() -> Self {
        Self::new()
    }
}
