import path from 'node:path';

const packages = path.resolve(import.meta.dirname, '../..');

const byService = {
  abilities: path.join(packages, 'abilities/migrations'),
  keys: path.join(packages, 'keys/migrations'),
  users: path.join(packages, 'users/migrations'),
  activities: path.join(packages, 'activities/migrations'),
  inboxes: path.join(packages, 'inboxes/migrations'),
  agendas: path.join(packages, 'agendas/migrations'),
  events: path.join(packages, 'events/migrations'),
  agendaEvents: path.join(packages, 'agenda-events/migrations'),
  members: path.join(packages, 'members/migrations'),
  networks: path.join(packages, 'networks/migrations'),
  formSchemas: path.join(packages, 'form-schemas/migrations'),
  custom: path.join(packages, 'custom/migrations'),
  agendaLocations: path.join(packages, 'agenda-locations/migrations'),
  aggregators: path.join(packages, 'aggregators/migrations'),
  usageCounters: path.join(packages, 'usage-counters/migrations'),
  invitations: path.join(packages, 'invitations/migrations'),
  unsubscriptions: path.join(packages, 'unsubscriptions/migrations'),
  accessTokens: path.join(
    packages,
    'cibul-node/services/accessTokens/migrations',
  ),
  crossService: path.join(packages, 'cibul-node/migrations'),
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
