use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub font_size: u32,
    pub theme: String,
    pub scrollback: u32,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            font_size: 14,
            theme: "dark".to_string(),
            scrollback: 10000,
        }
    }
}
