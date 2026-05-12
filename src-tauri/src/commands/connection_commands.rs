use tauri::State;
use crate::modules::connection::{ConnectionService, ConnectionInput};
use crate::error::Result;
use crate::modules::connection::Connection;

#[tauri::command]
pub async fn connection_get_all(
    service: State<'_, ConnectionService>,
) -> Result<Vec<Connection>> {
    service.get_all()
}

#[tauri::command]
pub async fn connection_get(
    service: State<'_, ConnectionService>,
    id: String,
) -> Result<Connection> {
    service.get_by_id(&id)
}

#[tauri::command]
pub async fn connection_create(
    service: State<'_, ConnectionService>,
    connection: ConnectionInput,
) -> Result<Connection> {
    service.create(connection)
}

#[tauri::command]
pub async fn connection_update(
    service: State<'_, ConnectionService>,
    id: String,
    connection: ConnectionInput,
) -> Result<Connection> {
    service.update(&id, connection)
}

#[tauri::command]
pub async fn connection_delete(
    service: State<'_, ConnectionService>,
    id: String,
) -> Result<()> {
    service.delete(&id)
}
