export interface Settings {
  fontSize: number;
  theme: 'dark' | 'light';
  scrollback: number;
}

export const defaultSettings: Settings = {
  fontSize: 14,
  theme: 'dark',
  scrollback: 10000,
};
