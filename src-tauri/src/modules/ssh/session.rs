use crate::error::{AppError, Result};
use crate::modules::connection::{Connection, AuthType};
use crate::infrastructure::crypto::DpapiCrypto;
use russh::client;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

pub struct SshSessionManager {
    sessions: Arc<RwLock<HashMap<String, client::Handle>>>,
}

impl SshSessionManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn connect(&self, connection: &Connection) -> Result<String> {
        let session_id = Uuid::new_v4().to_string();

        let config = client::Config {
            inactivity_timeout: Some(std::time::Duration::from_secs(60)),
            ..Default::default()
        };

        let config = Arc::new(config);
        let handler = crate::modules::ssh::handler::SshHandler::new(session_id.clone());

        let handle = client::connect(
            Arc::new(config),
            (connection.host.as_str(), connection.port),
            handler,
        )
        .await
        .map_err(|e| AppError::SshConnectionFailed(e.to_string()))?;

        let auth_result = match connection.auth_type {
            AuthType::Password => {
                if let Some(ref encrypted_pwd) = connection.password {
                    let crypto = DpapiCrypto::new();
                    let password = crypto.decrypt_base64(encrypted_pwd)?;
                    handle
                        .authenticate_password(&connection.username, &password)
                        .await
                } else {
                    return Err(AppError::InvalidCredentials);
                }
            }
            AuthType::Key => {
                if let Some(ref key_path) = connection.key_path {
                    let key_content = std::fs::read_to_string(key_path)
                        .map_err(|e| AppError::CryptoError(e.to_string()))?;
                    handle
                        .authenticate_publickey(
                            &connection.username,
                            russh_keys::decode_secret_key(&key_content, None)
                                .map_err(|e| AppError::CryptoError(e.to_string()))?,
                        )
                        .await
                } else {
                    return Err(AppError::InvalidCredentials);
                }
            }
        };

        if !auth_result {
            return Err(AppError::InvalidCredentials);
        }

        self.sessions.write().await.insert(session_id.clone(), handle);

        Ok(session_id)
    }

    pub async fn disconnect(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.write().await;
        if let Some(_handle) = sessions.remove(session_id) {
            tracing::info!("Disconnected session: {}", session_id);
        }
        Ok(())
    }

    pub async fn write(&self, session_id: &str, data: &[u8]) -> Result<()> {
        let sessions = self.sessions.read().await;
        let handle = sessions
            .get(session_id)
            .ok_or_else(|| AppError::SshConnectionFailed("Session not found".to_string()))?;

        handle
            .data(data, russh::ChannelMsg::ExtendedData::None)
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
