'use strict';

const Log = require('../utils/Log')('evaluateEvent');

const evaluateRules = require('../utils/rules');
const paths = require('../utils/paths');
const pickReferenceValues = require('../utils/pickReferenceValues');
const limit = require('../utils/limit');

module.exports = async (
  {
    getAggregatedCount,
    getMergedSchema,
    getEventReference, // fetch current ref on aggregator
    updateSourcePaths,
    referenceEvent,
    enqueueRemove
  },
  data
) => {
  const {
    agenda: sourceAgenda,
    event,
    aggregatorAgendaUid,
    batched,
    formSchema: sourceAgendaFormSchema,
    aggregatorLimit
  } = data;

  const log = Log(
    `${event.slug} of source ${sourceAgenda.slug} (${sourceAgenda.uid})`
  );

  if (
    typeof getAggregatedCount === 'function'
    && limit.exists(aggregatorLimit)
  ) {
    const aggregatedCount = await getAggregatedCount(aggregatorAgendaUid);

    log(
      `Aggregator agenda ${aggregatorAgendaUid} has ${aggregatedCount}/${aggregatorLimit} events`
    );

    if (limit.isReached(aggregatorLimit, aggregatedCount)) {
      log('Limit %s has been reached reached. Not processed');
      return;
    }
  }

  const rules = []
    .concat(data.aggregatorRules || [])
    .concat(data.sourceRules || []);

  const aggregatorSchema = await getMergedSchema(aggregatorAgendaUid);
  const evaluateResult = evaluateRules(
    rules,
    sourceAgendaFormSchema,
    aggregatorSchema,
    event
  );
  const reference = await getEventReference(aggregatorAgendaUid, event.uid);
  const shouldAggregate = rules.length ? !!evaluateResult : true;

  let updatedPaths;

  if (reference && !reference.aggregated) {
    log('is already referenced and was done so manually. Not processed.');
    return;
  }
  if (!shouldAggregate && !reference) {
    log('Is not and should not be referenced. Not processed.');
    return;
  }
  if (
    shouldAggregate
    && reference
    && !paths.updateIsRequired(
      reference.sourcePaths,
      event.sourcePaths,
      sourceAgenda.uid
    )
  ) {
    log(
      'Is referenced and should be through current source, but paths are unchanged. Not processed'
    );
    return;
  }

  if (reference && !shouldAggregate) {
    log('Is referenced, but should not be through current source', {
      step: 'alreadyReferenced'
    });
    updatedPaths = paths.getFiltered(reference.sourcePaths, sourceAgenda.uid);
  } else if (reference) {
    log(
      'Is reference and should be through current source. Paths need to be updated'
    );
    updatedPaths = paths.getAmended(
      reference.sourcePaths,
      event.sourcePaths,
      sourceAgenda.uid
    );
  }

  if (updatedPaths && !updatedPaths.length) {
    log('source paths are empty. Removing reference');
    return enqueueRemove({
      sourceAgendaUid: sourceAgenda.uid,
      eventUid: event.uid,
      aggregatorAgendaUid,
      reference,
      batched
    });
  }
  if (updatedPaths) {
    log('source paths need to be updated. Updating reference');
    return updateSourcePaths(aggregatorAgendaUid, event.uid, updatedPaths);
  }

  const refValues = pickReferenceValues(aggregatorSchema, evaluateResult);
  const { errors, success } = await referenceEvent(
    aggregatorAgendaUid,
    event.uid,
    refValues,
    {
      batched,
      paths: paths.getAmended([], event.sourcePaths, sourceAgenda.uid),
      sourceAgenda
    }
  );

  if (success) {
    log('done', { step: 'referenced' });
  } else {
    log('done', { step: 'not referenced', errors });
  }

  return {
    success,
    operation: 'aggregation'
  };
};
