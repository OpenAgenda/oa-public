import logs from '@openagenda/logs';
import getAgendaSearchIndex from './lib/getAgendaSearchIndex.js';

const log = logs('services/eventSearch/agendaIndexRebuild');

export default async (services, eventSearch, agenda) => {
  const { core } = services;

  const logBundle = { agenda: { uid: agenda.uid, slug: agenda.slug } };

  log.info('starting', logBundle);

  const searchIndex = getAgendaSearchIndex(eventSearch, agenda.uid);

  const formSchema = await core.agendas(agenda.uid).settings.schema.getMerged({
    includeMemberSchema: true,
  });

  const result = await searchIndex.rebuild({
    eventsList: (lastId, limit) =>
      core.agendas(agenda.uid).events.list(
        {},
        { lastId, limit },
        {
          returnPayload: true,
          detailed: true,
          access: 'internal',
          removed: null,
          load: { valid: true },
        },
      ),
    formSchema,
    ons: {
      bulk: (data) => {
        log.info('bulk', { ...logBundle, data });
      },
    },
  });

  log.info('done', logBundle);

  if (result.error) {
    log.error('Failed to complete', {
      ...logBundle,
      errorMeta: result.error?.meta,
    });
  }

  return result;
};
