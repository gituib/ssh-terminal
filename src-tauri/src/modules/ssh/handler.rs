use russh::client::{Handler, Session};
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::error::Result;

pub struct SshHandler {
    pub session_id: String,
}

impl SshHandler {
    pub fn new(session_id: String) -> Self {
        Self { session_id }
    }
}

impl Handler for SshHandler {
    type Error = russh::Error;

    fn check_server_key(
        &mut self,
        _server_public_key: &russh::key::PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }
}
