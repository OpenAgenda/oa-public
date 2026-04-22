import path from 'node:path';

const packages = path.resolve(import.meta.dirname, '../..');

const byService = {
  abilities: path.join(packages, 'abilities/migrations'),
  keys: path.join(packages, 'keys/migrations'),
  users: path.join(packages, 'users/migrations'),
  activities: path.join(packages, 'activities/migrations'),
  inboxes: path.join(packages, 'inboxes/migrations'),
};

function isEnabled(config, name) {
  const enabled = config?.enabled ?? [];
  const disabled = config?.disabled ?? [];
  if (enabled.length && !enabled.includes(name)) return false;
  if (disabled.includes(name)) return false;
  return true;
}

export default function migrationDirectories(config) {
  return Object.entries(byService)
    .filter(([name]) => !config || isEnabled(config, name))
    .map(([, directory]) => directory);
}
