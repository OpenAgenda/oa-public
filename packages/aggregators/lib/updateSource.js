import _ from 'lodash';
import logs from '@openagenda/logs';
import * as limit from '../utils/limit.js';

const log = logs('aggregators/updateSource');

export default async (
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
  const logBundle = {
    sourceId,
    aggregatorAgenda: _.pick(aggregatorAgenda, ['slug', 'uid']),
  };

  log.info('processing', logBundle);

  const { query = null } = options;
  const source = await getSourceEntry(sourceId, { detailed: true });

  if (!source) {
    log('not a source, throwing error', logBundle);
    throw new Error('No source was found');
  }

  const { aggregator } = await updateSourceEntry(
    aggregatorAgenda,
    source,
    sourceRules,
  );

  if (query !== null) {
    log('evaluating and done', logBundle);
    return enqueueLoadSourceEvaluates({
      aggregatorAgendaUid: aggregatorAgenda.uid,
      aggregatorRules: aggregator.rules,
      sourceAgenda: source.agenda,
      sourceRules,
      formSchema: await getMergedSchema(source.agenda.uid),
      aggregatorLimit: limit.get(aggregator),
      query,
    });
  }

  log('done', logBundle);
};
