use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::Path;
use std::sync::Mutex;
use time::OffsetDateTime;
use time::format_description;

#[allow(dead_code)]
pub struct FileLogger {
    file: Mutex<File>,
}

#[allow(dead_code)]
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
        let format = format_description::parse("[year]-[month]-[day] [hour]:[minute]:[second].[subsecond digits:3] UTC")
            .unwrap_or_else(|_| format_description::parse("[year]-[month]-[day] [hour]:[minute]:[second] UTC").unwrap());
        let timestamp = OffsetDateTime::now_utc()
            .format(&format)
            .unwrap_or_else(|_| "unknown".to_string());

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
