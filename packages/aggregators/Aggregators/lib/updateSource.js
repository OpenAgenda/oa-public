'use strict';

module.exports = async ({
  getAggregator,
  updateSourceEntry,
  getSourceEntry,
  getMergedSchema,
  enqueueLoadSourceEvaluates
}, aggregatorAgenda, sourceId, rules = [], options = {}) => {

  const {
    evaluate
  } = {
    evaluate: false,
    ...options
  }

  const source = await getSourceEntry(sourceId);

  if (!source) {
    throw new Error('No source was found');
  }

  const {
    aggregator,
    source: updatedSource
  } = await updateSourceEntry(aggregatorAgenda, source.agenda, rules);

  if (evaluate) {
    return enqueueLoadSourceEvaluates({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      aggregator,
      sourceAgenda: source.agenda,
      source: updatedSource,
      formSchema: await getMergedSchema(source.agenda.uid)
    });
  }
}
