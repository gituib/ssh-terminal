use async_trait::async_trait;
use russh::client::Handler;
use russh_keys::key::PublicKey;

pub struct SshHandler;

impl SshHandler {
    pub fn new() -> Self {
        Self
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
}
