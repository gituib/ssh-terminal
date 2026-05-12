use tauri::State;
use crate::modules::settings::{Settings, SettingsService};
use crate::error::Result;

#[tauri::command]
pub async fn settings_get(
    service: State<'_, SettingsService>,
) -> Result<Settings> {
    service.get()
}

#[tauri::command]
pub async fn settings_update(
    service: State<'_, SettingsService>,
    settings: Settings,
) -> Result<Settings> {
    service.update(settings)
}
