import logs from '@openagenda/logs';

const log = logs('services/users/resetCache');

export default async function resetCache(services, user) {
  const { simpleCache } = services;

  log('resetting');

  return Promise.all([
    simpleCache('users', `api_key:${user.apiKey}`).del(),
    simpleCache('users', `api_secret:${user.apiSecret}`).del(),
  ]);
}
