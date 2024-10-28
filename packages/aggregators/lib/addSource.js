'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');
const { BadRequest } = require('@openagenda/verror');
const limit = require('../utils/limit');

const log = logs('addSource');

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
  options = {},
) => {
  const logBundle = {
    sourceAgenda: _.pick(sourceAgenda, ['slug', 'uid']),
    aggregatorAgenda: _.pick(aggregatorAgenda, ['slug', 'uid']),
  };
  log.info('adding source', logBundle);
  const { query = null, context = {} } = options;

  if (await getAgendaSourceId(sourceAgenda, aggregatorAgenda)) {
    log('already source', logBundle);
    throw new BadRequest('Agenda is already source');
  }

  const { aggregator, source } = await addSourceEntry(
    aggregatorAgenda,
    sourceAgenda,
    sourceRules,
  );

  try {
    if (typeof onAddSource === 'function') {
      await onAddSource({ aggregatorAgenda, sourceAgenda }, context);
    }
  } catch (error) {
    log("can't call interface onAddSource", { ...logBundle, error });
  }

  if (query !== null) {
    log('evaluating and done', logBundle);

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

  log('not evaluating, done.', logBundle);

  return {
    aggregator,
    source,
  };
};
