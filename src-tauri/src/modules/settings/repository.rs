use crate::error::Result;
use crate::modules::settings::Settings;
use crate::infrastructure::storage::{AppPaths, FileStorage};
use tracing::info;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
struct AppConfig {
    connections: Vec<crate::modules::connection::Connection>,
    settings: Settings,
}

pub struct SettingsRepository {
    paths: AppPaths,
}

impl SettingsRepository {
    pub fn new() -> Self {
        Self {
            paths: AppPaths::new().expect("Failed to get app paths"),
        }
    }

    pub fn get(&self) -> Result<Settings> {
        let config: AppConfig = FileStorage::read(&self.paths.config_file)?;
        Ok(config.settings)
    }

    pub fn save(&self, settings: &Settings) -> Result<()> {
        let mut config: AppConfig = FileStorage::read(&self.paths.config_file).unwrap_or_default();
        config.settings = settings.clone();
        FileStorage::write(&self.paths.config_file, &config)?;
        info!("Settings saved");
        Ok(())
    }
}
