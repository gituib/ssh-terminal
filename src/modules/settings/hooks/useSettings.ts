import { useState, useCallback, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import type { Settings } from '../types';
import { defaultSettings } from '../types';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await settingsService.get();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取设置失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Settings) => {
    try {
      await settingsService.update(newSettings);
      setSettings(newSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存设置失败');
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  };
};
