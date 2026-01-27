import logs from '@openagenda/logs';

const log = logs('core/utils/refreshAgenda');

export default async (services, uid) => {
  const { agendas } = services;
  try {
    await agendas.set({ uid }, { updatedAt: new Date() }, { private: null });
  } catch (e) {
    log('error', 'failed to refresh agenda %s: %j', uid, e);
  }
};
