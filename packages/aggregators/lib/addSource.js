import _ from 'lodash';
import logs from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import * as limit from '../utils/limit.js';

const log = logs('addSource');

export default async (
  {
    getAgendaSourceId,
    getAgendasByUids,
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

  const sourceAgendaWithId = {
    ...sourceAgenda,
    id:
      sourceAgenda.id ?? _.first(await getAgendasByUids(sourceAgenda.uid))?.id,
  };
  const aggregatorAgendaWithId = {
    ...aggregatorAgenda,
    id:
      aggregatorAgenda.id
      ?? _.first(await getAgendasByUids(aggregatorAgenda.uid))?.id,
  };

  if (await getAgendaSourceId(sourceAgendaWithId, aggregatorAgendaWithId)) {
    log('already source', logBundle);
    throw new BadRequest('Agenda is already source');
  }

  const { aggregator, source } = await addSourceEntry(
    aggregatorAgendaWithId,
    sourceAgendaWithId,
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
      sourceAgenda: sourceAgendaWithId,
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
