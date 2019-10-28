'use strict';

const Log = require('../utils/Log')('Aggregators/updateSource');

module.exports = async ({
  getAggregator,
  updateSourceEntry,
  getSourceEntry,
  getMergedSchema,
  enqueueLoadSourceEvaluates
}, aggregatorAgenda, sourceId, rules = [], options = {}) => {
  const log = Log(`updating source ${sourceId} of ${aggregatorAgenda.slug}`);

  const {
    evaluate
  } = {
    evaluate: false,
    ...options
  }

  const source = await getSourceEntry(sourceId, { detailed: true });

  if (!source) {
    log('not a source, throwing error');
    throw new Error('No source was found');
  }

  const {
    aggregator,
    source: updatedSource
  } = await updateSourceEntry(aggregatorAgenda, source, rules);

  if (evaluate) {
    log('evaluating and done');
    return enqueueLoadSourceEvaluates({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      aggregator,
      sourceAgenda: source.agenda,
      source: updatedSource,
      formSchema: await getMergedSchema(source.agenda.uid)
    });
  }

  log('done');
}
