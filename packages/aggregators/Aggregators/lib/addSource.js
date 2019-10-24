'use strict';

const Log = require('../utils/Log')('Aggregators/addSource');

module.exports = async ({
  getAgendaSourceId,
  addSourceEntry,
  getMergedSchema,
  enqueueLoadSourceEvaluates
}, aggregatorAgenda, sourceAgenda, rules = [], options = {}) => {
  const log = Log(`adding ${sourceAgenda.slug} to ${aggregatorAgenda.slug}`);

  const {
    evaluate
  } = {
    evaluate: false,
    ...options
  }

  if (await getAgendaSourceId(sourceAgenda, aggregatorAgenda)) {
    log('already source, throwing error');
    throw new Error('Agenda is already source');
  }

  const {
    aggregator,
    source
  } = await addSourceEntry(aggregatorAgenda, sourceAgenda, rules);

  if (evaluate) {
    log('evaluating and done');
    return enqueueLoadSourceEvaluates({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      aggregator,
      sourceAgenda,
      source,
      formSchema: await getMergedSchema(sourceAgenda.uid)
    });
  }

  log('not evaluating, done.');
}
