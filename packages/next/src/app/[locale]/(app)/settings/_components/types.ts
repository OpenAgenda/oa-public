// Subset of the `/users/me` payload (see hooks/useUser) consumed by the
// settings sections. Kept local so sections don't depend on the hook's
// internal `User` type.
export type SettingsUser = {
  uid: number;
  fullName?: string;
  email?: string;
  culture?: string;
  hasLocalAccount?: boolean;
};

export const SETTINGS_LANGUAGES: { code: string; label: string }[] = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'br', label: 'Brezhoneg' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'oc', label: 'Occitan' },
];
