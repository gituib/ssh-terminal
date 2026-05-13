use async_trait::async_trait;
use russh::client::Handler;
use russh::ChannelId;
use russh_keys::key::PublicKey;
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;

pub struct SshHandler {
    pub session_id: String,
    pub app: AppHandle,
    pub channel_tx: mpsc::UnboundedSender<ChannelId>,
}

impl SshHandler {
    pub fn new(session_id: String, app: AppHandle) -> (Self, mpsc::UnboundedReceiver<ChannelId>) {
        let (tx, rx) = mpsc::unbounded_channel();
        let handler = Self {
            session_id,
            app,
            channel_tx: tx,
        };
        (handler, rx)
    }
}

#[async_trait]
impl Handler for SshHandler {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }

    async fn data(
        &mut self,
        _channel: ChannelId,
        data: &[u8],
        _session: &mut russh::client::Session,
    ) -> Result<(), Self::Error> {
        use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
        let encoded = BASE64.encode(data);
        let payload = serde_json::json!({
            "sessionId": self.session_id,
            "data": encoded,
        });
        let _ = self.app.emit("terminal:data", payload);
        Ok(())
    }

    async fn extended_data(
        &mut self,
        _channel: ChannelId,
        _ext: u32,
        data: &[u8],
        _session: &mut russh::client::Session,
    ) -> Result<(), Self::Error> {
        use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
        let encoded = BASE64.encode(data);
        let payload = serde_json::json!({
            "sessionId": self.session_id,
            "data": encoded,
        });
        let _ = self.app.emit("terminal:data", payload);
        Ok(())
    }

    async fn channel_open_confirmation(
        &mut self,
        channel: ChannelId,
        _max_packet_size: u32,
        _window_size: u32,
        _session: &mut russh::client::Session,
    ) -> Result<(), Self::Error> {
        let _ = self.channel_tx.send(channel);
        Ok(())
    }
}
