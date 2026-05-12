use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Connection not found: {0}")]
    ConnectionNotFound(String),

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("SSH connection failed: {0}")]
    SshConnectionFailed(String),

    #[error("Storage error: {0}")]
    StorageError(String),

    #[error("Crypto error: {0}")]
    CryptoError(String),

    #[error("Validation error: {0}")]
    ValidationError(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),
}
