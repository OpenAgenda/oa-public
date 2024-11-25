import logs from '@openagenda/logs';
import * as db from '../utils/db.js';
import getAgendaId from '../utils/getAgendaId.js';
import aggregatorExists from '../utils/aggregatorExists.js';
import validate from './validate.js';

const log = logs('aggregators/set');

export default async (knex, agendaUid, data, options = {}) => {
  const logBundle = {
    agenda: { uid: agendaUid },
  };
  log.info('setting', logBundle);

  const clean = validate(data, options);
  clean.createdAt = new Date();
  clean.updatedAt = clean.createdAt;

  const agendaId = await getAgendaId(knex, agendaUid);
  const exists = await aggregatorExists(knex, agendaId);

  const entry = db.toEntry({
    ...clean,
    updatedAt: new Date(),
    ...exists ? {} : { agendaId, createdAt: new Date() },
  });

  if (!exists) {
    log.info('creating', logBundle);
    await knex('aggregator').insert(entry);
  } else {
    log.info('updating', logBundle);
    await knex('aggregator').update(entry).where('review_id', agendaId);
  }

  if (exists) {
    if (options.patch) {
      return { operation: 'patch' };
    }

    return { operation: 'update' };
  }

  return {
    operation: 'create',
  };
};
