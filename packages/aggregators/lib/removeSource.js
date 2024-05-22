'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');

const log = logs('removeSource');

module.exports = async (
  {
    removeSourceEntry,
    getSourceEntry,
    enqueueLoadSourceRemoves,
    getAgendaSourceId,
    onRemoveSource,
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

  const sourceId = typeof sourceIdOrAgenda === 'object'
    ? await getAgendaSourceId(sourceIdOrAgenda, aggregatorAgenda)
    : sourceIdOrAgenda;

  log.info('removing source from aggregator', logBundle);

  const source = await getSourceEntry(sourceId, { detailed: true });

  if (!source) {
    log('no source was found, throwing error', logBundle);
    throw new Error('No source was found');
  }

  await removeSourceEntry(aggregatorAgenda, source.agenda);

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
