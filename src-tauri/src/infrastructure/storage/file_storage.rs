use crate::error::Result;
use serde::{de::DeserializeOwned, Serialize};
use std::path::Path;

pub struct FileStorage;

impl FileStorage {
    pub fn read<P: AsRef<Path>, T: DeserializeOwned + Default>(path: P) -> Result<T> {
        let path = path.as_ref();

        if !path.exists() {
            return Ok(T::default());
        }

        let content = std::fs::read_to_string(path)?;
        let data = serde_json::from_str(&content)?;
        Ok(data)
    }

    pub fn write<P: AsRef<Path>, T: Serialize>(path: P, data: &T) -> Result<()> {
        let path = path.as_ref();

        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let content = serde_json::to_string_pretty(data)?;
        std::fs::write(path, content)?;
        Ok(())
    }
}
