use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SshSession {
    pub session_id: String,
    pub connection_id: String,
    pub status: SshSessionStatus,
    pub connected_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SshSessionStatus {
    Connecting,
    Connected,
    Disconnected,
}
