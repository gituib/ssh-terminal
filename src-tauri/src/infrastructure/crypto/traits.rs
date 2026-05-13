#[allow(dead_code)]
pub trait Crypto {
    fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>, String>;
    fn decrypt(&self, data: &[u8]) -> Result<Vec<u8>, String>;
}
