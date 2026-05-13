use directories::ProjectDirs;
use std::path::PathBuf;

#[allow(dead_code)]
pub struct AppPaths {
    pub config_dir: PathBuf,
    pub config_file: PathBuf,
    pub log_dir: PathBuf,
}

impl AppPaths {
    pub fn new() -> Result<Self, std::io::Error> {
        let proj_dirs = ProjectDirs::from("com", "ssh-terminal", "SSH Terminal")
            .expect("Failed to get project directories");

        let config_dir = proj_dirs.config_dir().to_path_buf();
        let config_file = config_dir.join("config.json");
        let log_dir = proj_dirs.data_dir().join("logs");

        std::fs::create_dir_all(&config_dir)?;
        std::fs::create_dir_all(&log_dir)?;

        Ok(Self {
            config_dir,
            config_file,
            log_dir,
        })
    }
}

impl Default for AppPaths {
    fn default() -> Self {
        Self::new().expect("Failed to initialize app paths")
    }
}
