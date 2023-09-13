'use strict';

const Log = require('../utils/Log')('Aggregators/updateSource');

module.exports = async (
  {
    updateSourceEntry,
    getSourceEntry,
    getMergedSchema,
    enqueueLoadSourceEvaluates,
  },
  aggregatorAgenda,
  sourceId,
  sourceRules = [],
  options = {},
) => {
  const log = Log(`updating source ${sourceId} of ${aggregatorAgenda.slug}`);

  const { query = null } = options;
  const source = await getSourceEntry(sourceId, { detailed: true });

  if (!source) {
    log('not a source, throwing error');
    throw new Error('No source was found');
  }

  const { aggregator /* , source: updatedSource */ } = await updateSourceEntry(
    aggregatorAgenda,
    source,
    sourceRules,
  );

  if (query !== null) {
    log('evaluating and done');
    return enqueueLoadSourceEvaluates({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      aggregatorRules: aggregator.rules,
      sourceAgenda: source.agenda,
      sourceRules,
      formSchema: await getMergedSchema(source.agenda.uid),
      query,
    });
  }

  log('done');
};
