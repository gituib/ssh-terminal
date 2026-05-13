use tauri::{AppHandle, Emitter, State};
use crate::modules::ssh::SshSessionManager;
use crate::modules::connection::ConnectionService;
use serde::{Deserialize, Serialize};
use tracing::info;

#[derive(Debug, Serialize, Deserialize)]
#[allow(dead_code)]
pub struct TerminalPayload {
    pub session_id: String,
    pub data: String,
}

#[tauri::command]
pub async fn ssh_connect(
    app: AppHandle,
    session_manager: State<'_, SshSessionManager>,
    connection_service: State<'_, ConnectionService>,
    id: String,
) -> Result<String, String> {
    info!("Connecting to: {}", id);

    let connection = connection_service
        .get_by_id(&id)
        .map_err(|e| e.to_string())?;

    let session_id = session_manager
        .connect(&connection)
        .await
        .map_err(|e| e.to_string())?;

    app.emit("ssh:connected", &session_id)
        .map_err(|e| e.to_string())?;

    info!("Connected successfully: {}", session_id);
    Ok(session_id)
}

#[tauri::command]
pub async fn ssh_disconnect(
    app: AppHandle,
    session_manager: State<'_, SshSessionManager>,
    session_id: String,
) -> Result<(), String> {
    info!("Disconnecting session: {}", session_id);

    session_manager
        .disconnect(&session_id)
        .await
        .map_err(|e| e.to_string())?;

    app.emit("ssh:disconnected", &session_id)
        .map_err(|e| e.to_string())?;

    info!("Disconnected: {}", session_id);
    Ok(())
}

#[tauri::command]
pub async fn ssh_send_data(
    session_manager: State<'_, SshSessionManager>,
    session_id: String,
    data: String,
) -> Result<(), String> {
    use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

    let decoded = BASE64
        .decode(&data)
        .map_err(|e| format!("Base64 decode error: {}", e))?;

    session_manager
        .write(&session_id, &decoded)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
