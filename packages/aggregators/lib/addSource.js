'use strict';

const Log = require('../utils/Log')('Aggregators/addSource');
const limit = require('../utils/limit');

module.exports = async (
  {
    getAgendaSourceId,
    addSourceEntry,
    getMergedSchema,
    enqueueLoadSourceEvaluates,
  },
  aggregatorAgenda,
  sourceAgenda,
  sourceRules = [],
  options = {}
) => {
  const log = Log(`adding ${sourceAgenda.slug} to ${aggregatorAgenda.slug}`);
  const { query = null } = options;

  if (await getAgendaSourceId(sourceAgenda, aggregatorAgenda)) {
    log('already source, throwing error');
    throw new Error('Agenda is already source');
  }

  const { aggregator, source } = await addSourceEntry(
    aggregatorAgenda,
    sourceAgenda,
    sourceRules
  );

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
