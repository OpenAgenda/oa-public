import logs from '@openagenda/logs';

const log = logs('services/users/resetCache');

export default async function resetCache(services, user) {
  const {
    simpleCache,
    sessions,
  } = services;

  log('resetting');

  return Promise.all([
    sessions.refresh(user.uid),
    simpleCache('users', `api_key:${user.apiKey}`).del(),
    simpleCache('users', `api_secret:${user.apiSecret}`).del(),
  ]);
}
