import logs from '@openagenda/logs';
import serviceGet from '../get.js';
import loopThroughRefs from './lib/loopThroughRefs.js';
import getFormSchemaIds from './lib/getFormSchemaIds.js';
import legacySet from './set.js';

const log = logs('legacy/setAll');

export default async (config, agendaId) => {
  log('pushing to legacy dataset for agendaId', agendaId);

  const formSchemaIds = await getFormSchemaIds(config.knex, agendaId);

  return loopThroughRefs(config.knex, agendaId, async (ref) => {
    for (const formSchemaId of formSchemaIds) {
      await legacySet(
        formSchemaId,
        ref.uid,
        await serviceGet(formSchemaId, ref.uid),
        { agendaId },
      );
    }
  });
};
