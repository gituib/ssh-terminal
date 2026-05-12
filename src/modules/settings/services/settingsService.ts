import { invoke } from '@tauri-apps/api/core';
import type { Settings } from '../types';
import { defaultSettings } from '../types';

class SettingsService {
  async get(): Promise<Settings> {
    try {
      return await invoke<Settings>('settings_get');
    } catch {
      return defaultSettings;
    }
  }

  async update(settings: Settings): Promise<Settings> {
    return await invoke<Settings>('settings_update', { settings });
  }
}

export const settingsService = new SettingsService();
