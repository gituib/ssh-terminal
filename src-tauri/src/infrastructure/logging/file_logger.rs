use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::Path;
use std::sync::Mutex;
use time::OffsetDateTime;

pub struct FileLogger {
    file: Mutex<File>,
}

impl FileLogger {
    pub fn new<P: AsRef<Path>>(path: P) -> std::io::Result<Self> {
        let file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)?;

        Ok(Self {
            file: Mutex::new(file),
        })
    }

    pub fn log(&self, level: &str, message: &str) {
        let timestamp = OffsetDateTime::now_local()
            .unwrap_or_else(|_| OffsetDateTime::now_utc())
            .format("%Y-%m-%d %H:%M:%S%.3f");

        let entry = format!("[{}] [{}] {}\n", timestamp, level, message);

        if let Ok(mut file) = self.file.lock() {
            let _ = file.write_all(entry.as_bytes());
            let _ = file.flush();
        }
    }

    pub fn info(&self, message: &str) {
        self.log("INFO", message);
    }

    pub fn error(&self, message: &str) {
        self.log("ERROR", message);
    }

    pub fn debug(&self, message: &str) {
        self.log("DEBUG", message);
    }
}
