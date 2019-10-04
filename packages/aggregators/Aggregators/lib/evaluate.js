'use strict';

const ih = require('immutability-helper');

const log = require('@openagenda/logs')('Aggregators/evaluate');

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
  log('evaluate %s of source %s (%s)', event.slug, agenda.slug, agenda.uid);
  //wr('data', data);

  const eventWithTags = ih(event, {
    tags: {
      $set: convertSchemaOptionIdsToTags(data.formSchema, event)
    }
  });

  const rules = [].concat(
    data.aggregatorRules || []
  ).concat(
    data.sourceRules || []
  );

  const evaluateResult = evaluateRules(rules, eventWithTags);
  const reference = await getEventReference(aggregatorAgendaUid, event.uid);
  const shouldAggregate = rules.length ? !!evaluateResult : true;

  if (reference && !shouldAggregate) {
    log('is already referenced, but should not be through current source');
    return enqueueRemove({
      agenda,
      event,
      aggregatorAgendaUid,
      reference,
      batched
    });
  }

  if (!shouldAggregate) {
    log('does not pass set rules, will not aggregate');
    return;
  }

  if (reference && !reference.sourceAgendaUid.includes(agenda.uid)) {
    log('is already referenced, update of source uids is required');
    await setSourceUidOnExistingReference(aggregatorAgendaUid, event.uid, agenda.uid);
    return;
  }

  const aggregatorSchema = await getMergedSchema(aggregatorAgendaUid);
  //wr('getAggregatorMergedSchema', aggregatorSchema);
  const schemaValuesFromTags = convertTagsToSchemaOptionIds(aggregatorSchema, evaluateResult.tags);
  const extendedValues = pickSchemaValues(aggregatorSchema, evaluateResult, schemaValuesFromTags);

  referenceEvent(agenda, aggregatorAgendaUid, event.uid, extendedValues, { batched });

  return {
    success: true,
    operation: 'aggregation'
  }
}
