'use strict';

const ih = require('immutability-helper');
const Log = require('../utils/Log')('Aggregators/evaluateEvent');

const evaluateRules = require('../utils/rules');
const pickSchemaValues = require('../utils/pickSchemaValues');

module.exports = async ({
  getMergedSchema,
  getEventReference,
  setSourceUidOnExistingReference,
  referenceEvent,
  enqueueRemove
}, data) => {
  const {
    agenda,
    event,
    aggregatorAgendaUid,
    batched,
    formSchema: sourceAgendaFormSchema
  } = data;

  const log = Log(`${event.slug} of source ${agenda.slug} (${agenda.uid})`);

  const rules = [].concat(
    data.aggregatorRules || []
  ).concat(
    data.sourceRules || []
  );

  const aggregatorSchema = await getMergedSchema(aggregatorAgendaUid);
  const evaluateResult = evaluateRules(rules, sourceAgendaFormSchema, aggregatorSchema, event);
  const reference = await getEventReference(aggregatorAgendaUid, event.uid);
  const shouldAggregate = rules.length ? !!evaluateResult : true;

  if (reference && !shouldAggregate) {
    log('is already referenced, but should not be through current source', { step: 'alreadyReferenced' });
    return enqueueRemove({
      sourceAgendaUid: agenda.uid,
      eventUid: event.uid,
      aggregatorAgendaUid,
      reference,
      batched
    });
  }

  if (!shouldAggregate) {
    log('does not pass set rules, will not aggregate', { step: 'stoppedByRules' });
    return;
  }

  if (reference && !reference.sourceAgendaUid.includes(agenda.uid)) {
    log('is already referenced, update of source uids is required', { step: 'alreadyReferenced' });
    await setSourceUidOnExistingReference(aggregatorAgendaUid, event.uid, agenda.uid);
    return;
  }

  const schemaValues = pickSchemaValues(aggregatorSchema, evaluateResult);

  const { errors, success } = await referenceEvent(agenda, aggregatorAgendaUid, event.uid, schemaValues, { batched });

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
