'use strict';

const ih = require('immutability-helper');
const Log = require('../utils/Log')('evaluateEvent');

const evaluateRules = require('../utils/rules');
const paths = require('../utils/paths');
const pickSchemaValues = require('../utils/pickSchemaValues');

module.exports = async ({
  getMergedSchema,
  getEventReference, // fetch current ref on aggregator
  updateSourcePaths,
  referenceEvent,
  enqueueRemove
}, data) => {
  const {
    agenda: sourceAgenda,
    event,
    aggregatorAgendaUid,
    batched,
    formSchema: sourceAgendaFormSchema
  } = data;

  const log = Log(`${event.slug} of source ${sourceAgenda.slug} (${sourceAgenda.uid})`);

  const rules = [].concat(
    data.aggregatorRules || []
  ).concat(
    data.sourceRules || []
  );

  const aggregatorSchema = await getMergedSchema(aggregatorAgendaUid);
  const evaluateResult = evaluateRules(rules, sourceAgendaFormSchema, aggregatorSchema, event);
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
  if (shouldAggregate && reference && !paths.updateIsRequired(reference.sourcePaths, event.sourcePaths, sourceAgenda.uid)) {
    log('Is referenced and should be through current source, but paths are unchanged. Not processed');
    return;
  }

  if (reference && !shouldAggregate) {
    log('Is referenced, but should not be through current source', { step: 'alreadyReferenced' });
    updatedPaths = paths.getFiltered(reference.sourcePaths, sourceAgenda.uid);
  } else if (reference) {
    log('Is reference and should be through current source. Paths need to be updated');
    updatedPaths = paths.getAmended(reference.sourcePaths, event.sourcePaths, sourceAgenda.uid);
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
  } else if (updatedPaths) {
    log('source paths need to be updated. Updating reference');
    return updateSourcePaths(
      aggregatorAgendaUid,
      event.uid,
      updatedPaths
    );
  }

  const schemaValues = pickSchemaValues(aggregatorSchema, evaluateResult);
  const {
    errors,
    success
  } = await referenceEvent(aggregatorAgendaUid, event.uid, schemaValues, {
    batched,
    paths: paths.getAmended([], event.sourcePaths, sourceAgenda.uid),
    sourceAgenda
  });

  if (success) {
    log('done', { step: 'referenced' });
  } else {
    log('done', { step: 'not referenced', errors});
  }

  return {
    success,
    operation: 'aggregation'
  }
}
