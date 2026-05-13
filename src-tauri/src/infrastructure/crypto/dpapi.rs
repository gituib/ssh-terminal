use crate::error::Result;
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

pub struct DpapiCrypto;

impl DpapiCrypto {
    pub fn new() -> Self {
        Self
    }

    pub fn encrypt_base64(&self, plaintext: &str) -> Result<String> {
        let encrypted = self.encrypt(plaintext.as_bytes())?;
        Ok(BASE64.encode(&encrypted))
    }

    pub fn decrypt_base64(&self, ciphertext: &str) -> Result<String> {
        let decoded = BASE64
            .decode(ciphertext)
            .map_err(|e| crate::AppError::CryptoError(e.to_string()))?;

        let decrypted = self.decrypt(&decoded)?;
        String::from_utf8(decrypted).map_err(|e| crate::AppError::CryptoError(e.to_string()))
    }

    #[cfg(windows)]
    fn encrypt(&self, data: &[u8]) -> Result<Vec<u8>> {
        use std::ptr::null_mut;
        use windows::Win32::Security::Cryptography::{
            CryptProtectData, CRYPT_INTEGER_BLOB, CRYPTPROTECT_UI_FORBIDDEN,
        };

        let input = CRYPT_INTEGER_BLOB {
            cbData: data.len() as u32,
            pbData: data.as_ptr() as *mut u8,
        };

        let mut output = CRYPT_INTEGER_BLOB {
            cbData: 0,
            pbData: null_mut(),
        };

        unsafe {
            let result = CryptProtectData(
                &input,
                None,
                None,
                None,
                None,
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            );

            if result.is_err() {
                return Err(crate::AppError::CryptoError(
                    "DPAPI encrypt failed".to_string(),
                ));
            }

            let encrypted =
                std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec();

            Ok(encrypted)
        }
    }

    #[cfg(windows)]
    fn decrypt(&self, data: &[u8]) -> Result<Vec<u8>> {
        use std::ptr::null_mut;
        use windows::Win32::Security::Cryptography::{
            CryptUnprotectData, CRYPT_INTEGER_BLOB, CRYPTPROTECT_UI_FORBIDDEN,
        };

        let input = CRYPT_INTEGER_BLOB {
            cbData: data.len() as u32,
            pbData: data.as_ptr() as *mut u8,
        };

        let mut output = CRYPT_INTEGER_BLOB {
            cbData: 0,
            pbData: null_mut(),
        };

        unsafe {
            let result = CryptUnprotectData(
                &input,
                None,
                None,
                None,
                None,
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            );

            if result.is_err() {
                return Err(crate::AppError::CryptoError(
                    "DPAPI decrypt failed".to_string(),
                ));
            }

            let decrypted =
                std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec();

            Ok(decrypted)
        }
    }

    #[cfg(not(windows))]
    fn encrypt(&self, _data: &[u8]) -> Result<Vec<u8>> {
        Err(crate::AppError::CryptoError(
            "DPAPI is only available on Windows".to_string(),
        ))
    }

    #[cfg(not(windows))]
    fn decrypt(&self, _data: &[u8]) -> Result<Vec<u8>> {
        Err(crate::AppError::CryptoError(
            "DPAPI is only available on Windows".to_string(),
        ))
    }
}

impl Default for DpapiCrypto {
    fn default() -> Self {
        Self::new()
    }
}
