import logs from '@openagenda/logs';
import agendas from '@openagenda/agendas';

const log = logs('core/utils/refreshAgenda');

export default async (uid) => {
  try {
    await agendas.set({ uid }, { updatedAt: new Date() }, { private: null });
  } catch (e) {
    log('error', 'failed to refresh agenda %s: %j', uid, e);
  }
};
