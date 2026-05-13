use crate::error::Result;
use super::types::Settings;
use super::repository::SettingsRepository;

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

impl Default for SettingsService {
    fn default() -> Self {
        Self::new()
    }
}
