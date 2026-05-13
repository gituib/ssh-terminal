use std::sync::Arc;
use tokio::sync::RwLock;

#[allow(dead_code)]
pub struct ShellChannel {
    pub session_id: String,
    pub channel_id: u32,
}

#[allow(dead_code)]
pub struct ShellManager {
    shells: Arc<RwLock<Vec<ShellChannel>>>,
}

#[allow(dead_code)]
impl ShellManager {
    pub fn new() -> Self {
        Self {
            shells: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn add_shell(&self, session_id: String, channel_id: u32) {
        let shell = ShellChannel {
            session_id,
            channel_id,
        };
        self.shells.write().await.push(shell);
    }

    pub async fn remove_shell(&self, session_id: &str) {
        self.shells.write().await.retain(|s| s.session_id != session_id);
    }

    pub async fn get_channel_id(&self, session_id: &str) -> Option<u32> {
        self.shells
            .read()
            .await
            .iter()
            .find(|s| s.session_id == session_id)
            .map(|s| s.channel_id)
    }
}

impl Default for ShellManager {
    fn default() -> Self {
        Self::new()
    }
}
