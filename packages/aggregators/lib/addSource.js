'use strict';

const Log = require('../utils/Log')('Aggregators/addSource');
const limit = require('../utils/limit');

module.exports = async (
  {
    getAgendaSourceId,
    addSourceEntry,
    getMergedSchema,
    enqueueLoadSourceEvaluates,
    onAddSource,
  },
  aggregatorAgenda,
  sourceAgenda,
  sourceRules = [],
  options = {}
) => {
  const log = Log(`adding ${sourceAgenda.slug} to ${aggregatorAgenda.slug}`);
  const { query = null, context = {} } = options;

  if (await getAgendaSourceId(sourceAgenda, aggregatorAgenda)) {
    log('already source, throwing error');
    throw new Error('Agenda is already source');
  }

  const { aggregator, source } = await addSourceEntry(
    aggregatorAgenda,
    sourceAgenda,
    sourceRules
  );

  try {
    if (typeof onAddSource === 'function') {
      await onAddSource({ aggregatorAgenda, sourceAgenda }, context);
    }
  } catch (e) {
    log("can't call interface onAddSource", e);
  }

  if (query !== null) {
    log('evaluating and done');

    return enqueueLoadSourceEvaluates({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      aggregatorRules: aggregator.rules,
      aggregatorLimit: limit.get(aggregator),
      sourceAgenda,
      sourceRules,
      formSchema: await getMergedSchema(sourceAgenda.uid),
      query,
    });
  }

  log('not evaluating, done.');

  return {
    aggregator,
    source,
  };
};
