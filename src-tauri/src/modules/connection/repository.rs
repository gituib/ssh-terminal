use crate::error::Result;
use crate::infrastructure::storage::{AppPaths, FileStorage};
use super::types::{Connection, ConnectionInput};
use serde::{Deserialize, Serialize};
use tracing::info;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ConnectionsConfig {
    pub connections: Vec<Connection>,
}

pub struct ConnectionRepository {
    paths: AppPaths,
}

impl ConnectionRepository {
    pub fn new() -> Self {
        Self {
            paths: AppPaths::new().expect("Failed to get app paths"),
        }
    }

    pub fn get_all(&self) -> Result<Vec<Connection>> {
        let config: ConnectionsConfig = FileStorage::read(&self.paths.config_file)?;
        Ok(config.connections)
    }

    pub fn get_by_id(&self, id: &str) -> Result<Option<Connection>> {
        let connections = self.get_all()?;
        Ok(connections.into_iter().find(|c| c.id == id))
    }

    pub fn save(&self, connections: &[Connection]) -> Result<()> {
        let config = ConnectionsConfig {
            connections: connections.to_vec(),
        };
        FileStorage::write(&self.paths.config_file, &config)?;
        info!("Saved {} connections", connections.len());
        Ok(())
    }

    pub fn add(&self, connection: Connection) -> Result<Connection> {
        let mut connections = self.get_all()?;
        connections.push(connection.clone());
        self.save(&connections)?;
        Ok(connection)
    }

    pub fn update(&self, id: &str, input: ConnectionInput) -> Result<Connection> {
        let mut connections = self.get_all()?;
        let pos = connections
            .iter()
            .position(|c| c.id == id)
            .ok_or_else(|| crate::AppError::ConnectionNotFound(id.to_string()))?;

        let connection = Connection {
            id: id.to_string(),
            name: input.name,
            host: input.host,
            port: input.port,
            username: input.username,
            auth_type: input.auth_type,
            password: input.password,
            key_path: input.key_path,
            group: input.group,
        };

        connections[pos] = connection.clone();
        self.save(&connections)?;
        Ok(connection)
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        let mut connections = self.get_all()?;
        let original_len = connections.len();
        connections.retain(|c| c.id != id);

        if connections.len() == original_len {
            return Err(crate::AppError::ConnectionNotFound(id.to_string()));
        }

        self.save(&connections)?;
        Ok(())
    }
}
