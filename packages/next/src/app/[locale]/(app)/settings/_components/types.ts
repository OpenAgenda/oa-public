// Subset of the `/users/me` payload (see hooks/useUser) consumed by the
// settings sections. Kept local so sections don't depend on the hook's
// internal `User` type.
export type SettingsUser = {
  uid: number;
  fullName?: string;
  email?: string;
  culture?: string;
  image?: string | null;
  hasLocalAccount?: boolean;
  hasSocialAccount?: boolean;
  canCreateSecretKeys?: boolean;
  facebookUid?: string | null;
};

// Languages offered in the "Langue" select — the shared app list (single
// source; see config/constants), re-exported here for the settings sections.
export { LANGUAGES as SETTINGS_LANGUAGES } from 'config/constants';
