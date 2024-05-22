'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');

const evaluateRules = require('../utils/rules');
const paths = require('../utils/paths');
const pickReferenceValues = require('../utils/pickReferenceValues');
const limit = require('../utils/limit');
const generateChecksum = require('../utils/generateChecksum');

const log = logs('evaluateEvent');

const processEvaluate = async (
  {
    getAggregatedCount,
    getMergedSchema,
    getEventReference, // fetch current ref on aggregator
    updateSourcePaths,
    referenceEvent,
    updateEventReference,
    enqueueRemove,
  },
  {
    sourceAgenda,
    event,
    batched,
    sourceAgendaFormSchema,
    aggregatorProcessData,
  },
) => {
  const { sourceRules, aggregatorRules, aggregatorAgendaUid, aggregatorLimit } = aggregatorProcessData;
  const logBundle = {
    sourceAgenda: _.pick(sourceAgenda, ['uid', 'slug']),
    event: _.pick(event, ['uid', 'slug']),
    aggregatorAgenda: { uid: aggregatorAgendaUid },
    fn: 'processEvaluate',
  };

  log.info('processing', logBundle);

  if (
    typeof getAggregatedCount === 'function'
    && limit.exists(aggregatorLimit)
  ) {
    const aggregatedCount = await getAggregatedCount(aggregatorAgendaUid);

    if (limit.isReached(aggregatorLimit, aggregatedCount)) {
      log.info('limit has been reached', { ...logBundle, aggregatorLimit });
      return 'limitReached';
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
    log('aggregated checksum changed', {
      ...logBundle,
      stored: reference?.aggregated,
      new: aggregatedKey,
    });
  }

  const isShortestPath = (reference?.sourcePaths ?? []).length
    ? paths.endsShortestPath(reference.sourcePaths, sourceAgenda.uid)
    : true;

  let updatedPaths;

  if (reference && !reference.aggregated) {
    log.info(
      'is already referenced and was done so manually. Not processed.',
      logBundle,
    );
    return 'otherwiseAlreadyReferenced';
  }
  if (!shouldAggregate && !reference) {
    log.info('Is not and should not be referenced. Not processed.', logBundle);
    return 'notReferencedAndShouldNotBe';
  }

  if (shouldAggregate && reference && isShortestPath && evaluateResultChange) {
    updateEventReference({
      aggregatorAgendaUid,
      eventUid: event.uid,
      payload,
      batched,
      aggregated: aggregatedKey,
    });
    return 'updatedReference';
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
    log.info('Is referenced and should be. Paths unchanged.', logBundle);
    return 'isReferencedButUnchanged';
  }

  if (reference && !shouldAggregate) {
    log('Is referenced, but should not be through current source', {
      step: 'alreadyReferenced',
    });
    updatedPaths = paths.getFiltered(reference.sourcePaths, sourceAgenda.uid);
  } else if (reference) {
    log(
      'Is referenced and should be through current source. Paths need to be updated',
    );
    updatedPaths = paths.getAmended(
      reference.sourcePaths,
      event.sourcePaths,
      sourceAgenda.uid,
    );
  }

  if (updatedPaths && !updatedPaths.length) {
    log.info('Source paths are empty. Removing reference', logBundle);
    enqueueRemove({
      sourceAgendaUid: sourceAgenda.uid,
      event,
      aggregatorsBuffer: [{ aggregatorAgendaUid }],
      reference,
      batched,
    });

    return 'source paths are empty. Removing reference';
  }
  if (updatedPaths) {
    log.info('Source paths need to be updated. Updating reference', logBundle);
    updateSourcePaths({
      aggregatorAgendaUid,
      sourceAgenda,
      eventUid: event.uid,
      paths: updatedPaths,
    });
    return 'updateSourcePaths';
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
    log.info('done: referenced', logBundle);
  } else {
    log.info('done: failed to reference', { ...logBundle, errors });
  }

  return 'referenceEvent';
};

const evaluateEvent = async (
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
    report = { counts: {}, erroredEvents: [] },
  } = data;

  const logBundle = {
    event: _.pick(event, ['uid', 'slug']),
    sourceAgenda: _.pick(sourceAgenda, ['uid', 'slug']),
    fn: 'evaluateEvent',
    bufferLength: aggregatorsBuffer.length,
  };

  if (aggregatorsBuffer.length === 0) {
    log.info('done: no more items to process in buffer', {
      ...logBundle,
      report,
    });
    return;
  }

  log.info('processing next item', logBundle);

  const aggregatorProcessData = aggregatorsBuffer.shift();

  try {
    const action = await processEvaluate(
      {
        getAggregatedCount,
        getMergedSchema,
        getEventReference, // fetch current ref on aggregator
        updateSourcePaths,
        referenceEvent,
        updateEventReference,
        enqueueRemove,
      },
      {
        sourceAgenda,
        event,
        batched,
        sourceAgendaFormSchema,
        aggregatorProcessData,
      },
    );

    report.counts[action] = (report.counts[action] ?? 0) + 1;
  } catch (error) {
    log.info('errored', {
      ...logBundle,
      error,
      aggregatorAgenda: { uid: aggregatorProcessData.aggregatorAgendaUid },
    });
    report.errors = (report.errors ?? 0) + 1;
    report.erroredEvents = (report.erroredEvents ?? []).concat([event.uid]);
  }
  log.info('enqueuing remaining aggregator process list', logBundle);
  await enqueueEvaluate({ ...data, report });
};

module.exports = {
  processEvaluate,
  evaluateEvent,
};
