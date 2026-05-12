use crate::error::Result;
use crate::modules::settings::Settings;
use crate::infrastructure::storage::{AppPaths, FileStorage};
use tracing::info;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Default)]
struct AppConfig {
    connections: Vec<crate::modules::connection::Connection>,
    settings: Settings,
}

impl AppConfig {
    fn new() -> Self {
        Self {
            connections: Vec::new(),
            settings: Settings::default(),
        }
    }
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

pub struct SettingsService {
    repository: SettingsRepository,
}

impl SettingsService {
    pub fn new() -> Self {
        Self {
            repository: SettingsRepository::new(),
        }
    }

    pub fn get(&self) -> Result<Settings> {
        self.repository.get()
    }

    pub fn update(&self, settings: Settings) -> Result<Settings> {
        self.repository.save(&settings)?;
        Ok(settings)
    }
}
