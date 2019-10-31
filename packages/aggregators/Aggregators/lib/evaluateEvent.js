'use strict';

const ih = require('immutability-helper');
const Log = require('../utils/Log')('Aggregators/evaluateEvent');

const convertTagsToSchemaOptionIds = require('../utils/convertTagsToSchemaOptionIds');
const convertSchemaOptionIdsToTags = require('../utils/convertSchemaOptionIdsToTags');
const evaluateRules = require('../../lib/rules');
const pickSchemaValues = require('../utils/pickSchemaValues');

module.exports = async ({
  getMergedSchema,
  getEventReference,
  setSourceUidOnExistingReference,
  referenceEvent,
  enqueueRemove
}, data) => {
  const { agenda, event, aggregatorAgendaUid, batched } = data;
  const log = Log(`${event.slug} of source ${agenda.slug} (${agenda.uid})`);

  const tags = convertSchemaOptionIdsToTags(data.formSchema, event);

  const eventWithTags = ih(event, {
    tags: {
      $set: tags
    }
  });

  log('extracted tags: %s', tags);

  const rules = [].concat(
    data.aggregatorRules || []
  ).concat(
    data.sourceRules || []
  );

  const evaluateResult = evaluateRules(rules, eventWithTags);
  const reference = await getEventReference(aggregatorAgendaUid, event.uid);
  const shouldAggregate = rules.length ? !!evaluateResult : true;

  if (reference && !shouldAggregate) {
    log('is already referenced, but should not be through current source', { step: 'alreadyReferenced' });
    return enqueueRemove({
      agenda,
      event,
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

  const aggregatorSchema = await getMergedSchema(aggregatorAgendaUid);
  const schemaValuesFromTags = convertTagsToSchemaOptionIds(aggregatorSchema, evaluateResult.tags);
  const extendedValues = pickSchemaValues(aggregatorSchema, evaluateResult, schemaValuesFromTags);

  if (evaluateResult.state !== undefined) {
    extendedValues.state = evaluateResult.state;
  }

  await referenceEvent(agenda, aggregatorAgendaUid, event.uid, extendedValues, { batched });

  log('done', { step: 'referenced' });
  return {
    success: true,
    operation: 'aggregation'
  }
}
