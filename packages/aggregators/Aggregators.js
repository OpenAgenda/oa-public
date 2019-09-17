'use strict';

const log = require('@openagenda/logs')('Aggregators');

const ih = require('immutability-helper');
const isAgendaSource = require('./lib/isAgendaSource');
const getSourceAndAggregatorPairs = require('./lib/getSourceAndAggregatorPairs');
const convertTagsToSchemaOptionIds = require('./lib/convertTagsToSchemaOptionIds');
const convertSchemaOptionIdsToTags = require('./lib/convertSchemaOptionIdsToTags');
const determineAggregationAction = require('./lib/determineAggregationAction');
const pickSchemaValues = require('./lib/pickSchemaValues');

const evaluateRules = require('./lib/rules');

module.exports = ({ knex, queues, interfaces }) => {
  const queue = queues('aggregator');

  queue.register({
    dispatch: dispatch.bind(null, { knex, queue }),
    evaluate: evaluate.bind(null, interfaces),
    remove: remove.bind(null, interfaces)
  });

  queue.on('error', (fn, args, error) => log('error', fn, args, error));
  queue.on('execute', (fn, args) => log(fn, 'execute'));
  queue.on('success', (fn, args, result) => log(fn, 'success', result));

  return {
    notify: notify.bind(null, {
      isAgendaSource: isAgendaSource.bind(null, knex),
      queue
    }),
    task: task.bind(null, { queue })
  };
}

async function notify({ isAgendaSource, queue }, type, data, options = {}) {
  const { agenda } = data;
  // add, remove, update
  log('notify %s on %s (%s)', type, agenda.slug, agenda.uid);

  const aggregationAction = determineAggregationAction(type, data.before, data.event);

  if (!aggregationAction) {
    log('no aggregation action is taken');
    return;
  }

  if (!await isAgendaSource(agenda)) {
    log('agenda %s is not a source', agenda.slug);
    return;
  }

  queue('dispatch', aggregationAction, data);
}

function task({ queue }) {
  queue.run();
}

async function dispatch({ queue, knex }, action, data) {
  log('dispatch');
  const { agenda, event } = data;

  const aggregators = await getSourceAndAggregatorPairs(knex, agenda);

  for (const ag of aggregators) {
    if (action === 'evaluate') {
      await queue('evaluate', Object.assign({
        aggregatorAgendaUid: ag.agendaUid,
        sourceRules: ag.sourceRules,
        aggregatorRules: ag.aggregatorRules
      }, data));
    } else {
      await queue('remove', {
        aggregatorAgendaUid: ag.agendaUid,
        agenda,
        event
      });
    }
  }
}

async function remove({
  getAggregatorEventReference,
  unsetSourceUidOnExistingReference,
  unreferenceEvent
}, data) {
  const { aggregatorAgendaUid, agenda, event } = data;

  log('remove %s of source %s (%s) from %s', event.slug, agenda.slug, agenda.uid, aggregatorAgendaUid);

  const reference = data.reference || await getAggregatorEventReference(aggregatorAgendaUid, event.uid);

  const { sourceAgendaUid } = reference;

  log('references: %j', sourceAgendaUid);

  const update = sourceAgendaUid.filter(uid => uid!==agenda.uid);

  if (update.length) {
    log('other source references are present, current source ref must be removed');
    await unsetSourceUidOnExistingReference(aggregatorAgendaUid, event.uid, agenda.uid);
  } else {
    log('no source references are left, event must be unlisted from aggregator agenda');
    await unreferenceEvent(agenda.uid, aggregatorAgendaUid, event.uid);
  }
}

async function evaluate({
  getAggregatorMergedSchema,
  getAggregatorEventReference,
  setSourceUidOnExistingReference,
  unsetSourceUidOnExistingReference,
  referenceEvent,
  unreferenceEvent
}, data) {
  const { agenda, event, aggregatorAgendaUid } = data;
  log('evaluate %s of source %s (%s)', event.slug, agenda.slug, agenda.uid);

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
  const reference = await getAggregatorEventReference(aggregatorAgendaUid, event.uid);
  const shouldAggregate = rules.length ? !!evaluateResult : true;

  if (reference && !shouldAggregate) {
    log('is already referenced, but should not be through current source');
    return remove({
      unsetSourceUidOnExistingReference,
      getAggregatorEventReference,
      unreferenceEvent
    }, { agenda, event, aggregatorAgendaUid, reference });
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

  const aggregatorSchema = await getAggregatorMergedSchema(aggregatorAgendaUid);
  const schemaValuesFromTags = convertTagsToSchemaOptionIds(aggregatorSchema, evaluateResult.tags);
  const extendedValues = pickSchemaValues(aggregatorSchema, evaluateResult, schemaValuesFromTags);

  return referenceEvent(agenda.uid, aggregatorAgendaUid, event.uid, Object.assign(extendedValues, {
    sourceAgendaUid: [agenda.uid]
  }));
}
