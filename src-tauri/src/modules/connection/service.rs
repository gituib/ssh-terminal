use crate::error::Result;
use crate::infrastructure::crypto::DpapiCrypto;
use super::types::{Connection, ConnectionInput};
use super::{ConnectionRepository, ConnectionValidator};
use uuid::Uuid;
use tracing::info;

pub struct ConnectionService {
    repository: ConnectionRepository,
    validator: ConnectionValidator,
    crypto: DpapiCrypto,
}

impl ConnectionService {
    pub fn new() -> Self {
        Self {
            repository: ConnectionRepository::new(),
            validator: ConnectionValidator,
            crypto: DpapiCrypto::new(),
        }
    }

    pub fn get_all(&self) -> Result<Vec<Connection>> {
        self.repository.get_all()
    }

    pub fn get_by_id(&self, id: &str) -> Result<Connection> {
        self.repository
            .get_by_id(id)?
            .ok_or_else(|| crate::AppError::ConnectionNotFound(id.to_string()))
    }

    pub fn create(&self, input: ConnectionInput) -> Result<Connection> {
        self.validator.validate(&input)?;

        let password = if let Some(ref pwd) = input.password {
            Some(self.crypto.encrypt_base64(pwd)?)
        } else {
            None
        };

        let connection = Connection {
            id: Uuid::new_v4().to_string(),
            name: input.name,
            host: input.host,
            port: input.port,
            username: input.username,
            auth_type: input.auth_type,
            password,
            key_path: input.key_path,
            group: input.group,
        };

        info!("Creating connection: {}", connection.name);
        self.repository.add(connection)
    }

    pub fn update(&self, id: &str, input: ConnectionInput) -> Result<Connection> {
        self.validator.validate(&input)?;

        let password = if let Some(ref pwd) = input.password {
            if pwd.starts_with("base64:") {
                Some(pwd.replace("base64:", ""))
            } else {
                Some(self.crypto.encrypt_base64(pwd)?)
            }
        } else {
            None
        };

        let input_with_password = ConnectionInput {
            password,
            ..input
        };

        info!("Updating connection: {}", id);
        self.repository.update(id, input_with_password)
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        info!("Deleting connection: {}", id);
        self.repository.delete(id)
    }

    #[allow(dead_code)]
    pub fn decrypt_password(&self, encrypted: &str) -> Result<String> {
        self.crypto.decrypt_base64(encrypted)
    }
}
