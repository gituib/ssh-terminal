use crate::error::{AppError, Result};
use super::types::ConnectionInput;

pub struct ConnectionValidator;

impl ConnectionValidator {
    pub fn validate(&self, input: &ConnectionInput) -> Result<()> {
        if input.name.trim().is_empty() {
            return Err(AppError::ValidationError("Name is required".to_string()));
        }

        if input.host.trim().is_empty() {
            return Err(AppError::ValidationError("Host is required".to_string()));
        }

        if input.port == 0 || input.port > 65535 {
            return Err(AppError::ValidationError(
                "Port must be between 1 and 65535".to_string(),
            ));
        }

        if input.username.trim().is_empty() {
            return Err(AppError::ValidationError("Username is required".to_string()));
        }

        match input.auth_type {
            super::types::AuthType::Password => {
                if input.password.is_none() || input.password.as_ref().unwrap().is_empty() {
                    return Err(AppError::ValidationError("Password is required".to_string()));
                }
            }
            super::types::AuthType::Key => {
                if input.key_path.is_none() || input.key_path.as_ref().unwrap().is_empty() {
                    return Err(AppError::ValidationError(
                        "Key path is required".to_string(),
                    ));
                }
            }
        }

        Ok(())
    }
}
