import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('removeSource');

export default async (
  {
    removeSourceEntry,
    getSourceEntry,
    enqueueLoadSourceRemoves,
    getAgendaSourceId,
    onRemoveSource,
    getAgendasByUids,
  },
  aggregatorAgenda,
  sourceIdOrAgenda,
  options = {},
) => {
  const { evaluate = false, context = {} } = options;

  const logBundle = {
    aggregatorAgenda: _.pick(aggregatorAgenda, ['slug', 'uid']),
    sourceIdOrAgenda,
  };

  const aggregatorAgendaWithId = {
    ...aggregatorAgenda,
    id:
      aggregatorAgenda.id
      ?? _.first(await getAgendasByUids(aggregatorAgenda.uid))?.id,
  };

  const sourceId = typeof sourceIdOrAgenda === 'object'
    ? await getAgendaSourceId(sourceIdOrAgenda, aggregatorAgendaWithId)
    : sourceIdOrAgenda;

  log.info('removing source from aggregator', logBundle);

  const source = await getSourceEntry(sourceId, { detailed: true });

  if (!source) {
    log('no source was found, throwing error', logBundle);
    throw new Error('No source was found');
  }

  await removeSourceEntry(aggregatorAgendaWithId, source.agenda);

  try {
    if (typeof onRemoveSource === 'function') {
      await onRemoveSource(
        { aggregatorAgenda, sourceAgenda: source.agenda },
        context,
      );
    }
  } catch (error) {
    log("can't call interface onAddSource", { ...logBundle, error });
  }

  if (evaluate) {
    log('source removed, evaluating', logBundle);
    return enqueueLoadSourceRemoves({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      sourceAgendaUid: source.agenda.uid,
    });
  }
  log('source removed, not evaluating', logBundle);
};
