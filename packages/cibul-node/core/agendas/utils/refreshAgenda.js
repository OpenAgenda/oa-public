import { promisify } from 'node:util';
import logs from '@openagenda/logs';
import agendas from '@openagenda/agendas';

const log = logs('core/utils/refreshAgenda');

const setAgenda = promisify(agendas.set);

export default async (uid) => {
  try {
    await setAgenda({ uid }, { updatedAt: new Date() }, { private: null });
  } catch (e) {
    log('error', 'failed to refresh agenda %s: %j', uid, e);
  }
};
