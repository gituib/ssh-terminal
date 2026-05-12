mod commands;
mod error;
mod infrastructure;
mod modules;

use modules::connection::ConnectionService;
use modules::settings::SettingsService;
use modules::ssh::SshSessionManager;

pub use error::{AppError, Result};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter("ssh_terminal=debug,info")
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(ConnectionService::new())
        .manage(SettingsService::new())
        .manage(SshSessionManager::new())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.set_title("SSH Terminal").unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::connection_commands::connection_get_all,
            commands::connection_commands::connection_get,
            commands::connection_commands::connection_create,
            commands::connection_commands::connection_update,
            commands::connection_commands::connection_delete,
            commands::settings_commands::settings_get,
            commands::settings_commands::settings_update,
            commands::ssh_commands::ssh_connect,
            commands::ssh_commands::ssh_disconnect,
            commands::ssh_commands::ssh_send_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
