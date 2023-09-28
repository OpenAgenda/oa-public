'use strict';

const Log = require('../utils/Log')('evaluateEvent');

const evaluateRules = require('../utils/rules');
const paths = require('../utils/paths');
const pickReferenceValues = require('../utils/pickReferenceValues');
const limit = require('../utils/limit');
const generateChecksum = require('../utils/generateChecksum');

module.exports = async (
  {
    getAggregatedCount,
    getMergedSchema,
    getEventReference, // fetch current ref on aggregator
    updateSourcePaths,
    referenceEvent,
    updateEventReference,
    enqueueRemove,
    enqueueEvaluate,
  },
  data,
) => {
  const {
    agenda: sourceAgenda,
    event,
    batched,
    formSchema: sourceAgendaFormSchema,
    aggregatorsBuffer,
  } = data;

  const log = Log(
    `${event.slug} of source ${sourceAgenda.slug} (${sourceAgenda.uid})`,
  );

  if (aggregatorsBuffer.length === 0) {
    log('no more items in aggregatorsBuffer');
    return;
  }
  const aggregator = aggregatorsBuffer.shift();
  const { sourceRules, aggregatorRules, aggregatorAgendaUid, aggregatorLimit } = aggregator;

  if (
    typeof getAggregatedCount === 'function'
    && limit.exists(aggregatorLimit)
  ) {
    const aggregatedCount = await getAggregatedCount(aggregatorAgendaUid);

    log(
      `Aggregator agenda ${aggregatorAgendaUid} has ${aggregatedCount}/${
        aggregatorLimit ?? 'unlimited'
      } events`,
    );

    if (limit.isReached(aggregatorLimit, aggregatedCount)) {
      log(
        'info',
        'Limit %s has been reached reached on aggregator agenda uid %s. Not processed',
        aggregatorLimit,
        aggregatorAgendaUid,
      );
      return;
    }
  }

  const rules = [].concat(aggregatorRules || []).concat(sourceRules || []);

  const aggregatorSchema = await getMergedSchema(aggregatorAgendaUid);
  const evaluateResult = evaluateRules(
    rules,
    sourceAgendaFormSchema,
    aggregatorSchema,
    event,
  );

  const payload = evaluateResult
    ? pickReferenceValues(aggregatorSchema, evaluateResult)
    : null;

  const aggregatedKey = generateChecksum(payload);

  const reference = await getEventReference(aggregatorAgendaUid, event.uid);
  const shouldAggregate = rules.length ? !!evaluateResult : true;

  const evaluateResultChange = reference && reference?.aggregated !== aggregatedKey;
  if (evaluateResultChange) {
    log(
      'aggregated checksum changed: stored %s vs new %s',
      reference?.aggregated,
      aggregatedKey,
    );
  } else {
    log('aggregated checksum did not change');
  }

  const isShortestPath = (reference?.sourcePaths ?? []).length
    ? paths.endsShortestPath(reference.sourcePaths, sourceAgenda.uid)
    : true;

  let updatedPaths;

  if (reference && !reference.aggregated) {
    log('is already referenced and was done so manually. Not processed.');
    await enqueueEvaluate({ aggregatorsBuffer, ...data });
    return;
  }
  if (!shouldAggregate && !reference) {
    log('Is not and should not be referenced. Not processed.');
    await enqueueEvaluate({ aggregatorsBuffer, ...data });
    return;
  }

  if (shouldAggregate && reference && isShortestPath && evaluateResultChange) {
    updateEventReference({
      aggregatorAgendaUid,
      eventUid: event.uid,
      payload,
      batched,
      aggregated: aggregatedKey,
    });
    await enqueueEvaluate({ aggregatorsBuffer, ...data });
    return;
  }

  if (
    shouldAggregate
    && reference
    && !paths.updateIsRequired(
      reference.sourcePaths,
      event.sourcePaths,
      sourceAgenda.uid,
    )
  ) {
    log(
      'Is referenced and should be through current source, but paths are unchanged. Not processed',
    );
    await enqueueEvaluate({ aggregatorsBuffer, ...data });
    return;
  }

  if (reference && !shouldAggregate) {
    log('Is referenced, but should not be through current source', {
      step: 'alreadyReferenced',
    });
    updatedPaths = paths.getFiltered(reference.sourcePaths, sourceAgenda.uid);
  } else if (reference) {
    log(
      'Is reference and should be through current source. Paths need to be updated',
    );
    updatedPaths = paths.getAmended(
      reference.sourcePaths,
      event.sourcePaths,
      sourceAgenda.uid,
    );
  }

  if (updatedPaths && !updatedPaths.length) {
    log('source paths are empty. Removing reference');
    enqueueRemove({
      sourceAgendaUid: sourceAgenda.uid,
      eventUid: event.uid,
      aggregatorAgendaUid,
      reference,
      batched,
    });
    await enqueueEvaluate({ aggregatorsBuffer, ...data });
    return;
  }
  if (updatedPaths) {
    log('source paths need to be updated. Updating reference');
    await enqueueEvaluate({ aggregatorsBuffer, ...data });
    return updateSourcePaths({
      aggregatorAgendaUid,
      sourceAgenda,
      eventUid: event.uid,
      paths: updatedPaths,
    });
  }

  const { errors, success } = await referenceEvent({
    aggregatorAgendaUid,
    eventUid: event.uid,
    payload,
    paths: paths.getAmended([], event.sourcePaths, sourceAgenda.uid),
    batched,
    sourceAgenda,
    aggregated: aggregatedKey,
  });

  if (success) {
    log('done', { step: 'referenced' });
  } else {
    log('done', { step: 'not referenced', errors });
  }
  await enqueueEvaluate({ aggregatorsBuffer, ...data });
  return {
    success,
    operation: 'aggregation',
  };
};
