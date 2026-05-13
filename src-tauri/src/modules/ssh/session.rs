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

        tracing::info!(
            "Connecting to {}:{} as {} (auth: {:?})",
            connection.host,
            connection.port,
            connection.username,
            connection.auth_type
        );

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
        .map_err(|e| {
            tracing::error!("SSH connection failed: {}", e);
            AppError::SshConnectionFailed(format!("Cannot connect to {}:{} - {}", connection.host, connection.port, e))
        })?;

        tracing::info!("TCP connection established, authenticating...");

        let auth_ok = match connection.auth_type {
            AuthType::Password => {
                if let Some(ref encrypted_pwd) = connection.password {
                    if encrypted_pwd.is_empty() {
                        tracing::error!("Password field is empty");
                        return Err(AppError::InvalidCredentials);
                    }

                    let crypto = DpapiCrypto::new();
                    let password = match crypto.decrypt_base64(encrypted_pwd) {
                        Ok(p) => p,
                        Err(e) => {
                            tracing::error!("Password decryption failed: {:?}", e);
                            return Err(AppError::CryptoError("Failed to decrypt password".to_string()));
                        }
                    };

                    tracing::info!("Attempting password authentication...");
                    match handle
                        .authenticate_password(&connection.username, &password)
                        .await
                    {
                        Ok(ok) => ok,
                        Err(e) => {
                            tracing::error!("Password authentication error: {}", e);
                            return Err(AppError::SshConnectionFailed(format!("Auth error: {}", e)));
                        }
                    }
                } else {
                    tracing::error!("No password provided for password authentication");
                    return Err(AppError::InvalidCredentials);
                }
            }
            AuthType::Key => {
                if let Some(ref key_path) = connection.key_path {
                    let key_content = std::fs::read_to_string(key_path)
                        .map_err(|e| {
                            tracing::error!("Cannot read key file {}: {}", key_path, e);
                            AppError::CryptoError(format!("Cannot read key file: {}", e))
                        })?;
                    let key_pair = russh_keys::decode_secret_key(&key_content, None)
                        .map_err(|e| {
                            tracing::error!("Cannot decode secret key: {}", e);
                            AppError::CryptoError(format!("Invalid key: {}", e))
                        })?;
                    tracing::info!("Attempting public key authentication...");
                    match handle
                        .authenticate_publickey(&connection.username, Arc::new(key_pair))
                        .await
                    {
                        Ok(ok) => ok,
                        Err(e) => {
                            tracing::error!("Public key authentication error: {}", e);
                            return Err(AppError::SshConnectionFailed(format!("Auth error: {}", e)));
                        }
                    }
                } else {
                    tracing::error!("No key path provided for key authentication");
                    return Err(AppError::InvalidCredentials);
                }
            }
        };

        if !auth_ok {
            tracing::error!("Authentication failed for user {}", connection.username);
            return Err(AppError::SshConnectionFailed(
                "Authentication failed - check your username and password".to_string(),
            ));
        }

        tracing::info!("Authentication successful, opening channel...");

        let channel = handle
            .channel_open_session()
            .await
            .map_err(|e| {
                tracing::error!("Channel open failed: {}", e);
                AppError::SshConnectionFailed(format!("Channel open failed: {}", e))
            })?;

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
            .map_err(|e| {
                tracing::error!("PTY request failed: {}", e);
                AppError::SshConnectionFailed(format!("PTY request failed: {}", e))
            })?;

        channel
            .request_shell(true)
            .await
            .map_err(|e| {
                tracing::error!("Shell request failed: {}", e);
                AppError::SshConnectionFailed(format!("Shell request failed: {}", e))
            })?;

        tracing::info!("Session {} connected successfully", session_id);

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
