import logs from '@openagenda/logs';

const log = logs('services/members/clearCache');

export default async function clearCache(services, member) {
  const { simpleCache } = services;

  try {
    await simpleCache.hash('members', `${member.agendaUid}.${member.userUid}`).del();
    log('clear member cache');
  } catch (e) {
    log('error', 'failed to clear member cache', { member, exception: e });
  }
}
