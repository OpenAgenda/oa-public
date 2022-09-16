'use strict';

const Log = require('../utils/Log')('Aggregators/removeSource');

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
  options = {}
) => {
  const { evaluate = false, context = {} } = options;

  const sourceId = typeof sourceIdOrAgenda === 'object'
    ? await getAgendaSourceId(sourceIdOrAgenda, aggregatorAgenda)
    : sourceIdOrAgenda;

  const log = Log(
    `removing source ${sourceId} from aggregator ${aggregatorAgenda.slug}`
  );

  const source = await getSourceEntry(sourceId, { detailed: true });

  if (!source) {
    log('no source was found, throwing error');
    throw new Error('No source was found');
  }

  await removeSourceEntry(aggregatorAgenda, source.agenda);

  try {
    if (typeof onRemoveSource === 'function') {
      await onRemoveSource(
        { aggregatorAgenda, sourceAgenda: source.agenda },
        context
      );
    }
  } catch (e) {
    log("can't call interface onAddSource", e);
  }

  if (evaluate) {
    log('source removed, evaluating');
    return enqueueLoadSourceRemoves({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      sourceAgendaUid: source.agenda.uid,
    });
  }
  log('source removed, not evaluating');
};
