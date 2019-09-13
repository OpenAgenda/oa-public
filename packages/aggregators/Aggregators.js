'use strict';

const log = require('@openagenda/logs')('Aggregators');

const fs = require('fs');
const isAgendaSource = require('./lib/isAgendaSource');
const getSourceAndAggregatorPairs = require('./lib/getSourceAndAggregatorPairs');
const formatEventForEvaluation = require('./lib/formatEventForEvaluation');
const evaluateRules = require('./lib/rules');

module.exports = ({ knex, queues, interfaces }) => {
  const queue = queues('aggregator');

  queue.register({
    dispatch: dispatch.bind(null, { knex, queue }),
    evaluate: evaluate.bind(null, interfaces)
  });

  queue.on('error', (fn, args, error) => log('error', fn, args, error));
  queue.on('execute', (fn, args) => log(fn, 'execute'));
  queue.on('success', (fn, args, result) => log(fn, 'success'));

  return {
    notifyPublish: notify.bind(null, {
      isAgendaSource: isAgendaSource.bind(null, knex),
      queue,
      type: 'publish'
    }),
    notifyUnpublish: notify.bind(null, {
      isAgendaSource: isAgendaSource.bind(null, knex),
      queue,
      type: 'unpublish'
    }),
    task: task.bind(null, { queue })
  };

}

async function notify({ isAgendaSource, queue, type }, data) {
  log('notify');
  //{ agenda, event, custom, networkCustom, formSchemas }
  const { agenda } = data;
  if (!await isAgendaSource(agenda)) {
    log('not source');
    return;
  }
  queue('dispatch', type, data);
}

function task({ queue }) {
  queue.run();
}

async function dispatch({ queue, knex }, type, data) {
  log('dispatch');
  const { agenda } = data;

  const sourceAggregators = await getSourceAndAggregatorPairs(knex, agenda);

  if (type==='publish') {
    for (const sa of sourceAggregators) {
      await queue('evaluate', Object.assign({
        aggregatorAgendaUid: sa.agendaUid,
        sourceRules: sa.sourceRules,
        aggregatorRules: sa.aggregatorRules
      }, data));
    }
  } else {
    log('unpublish');
  }
}

async function evaluate({ getAggregatorSchemas }, data) {
  log('evaluate');

  const aggregatorSchemas = await getAggregatorSchemas(data.aggregatorAgendaUid);

  const formattedEvent = formatEventForEvaluation({
    formSchemas: data.formSchemas
  }, {
    event: data.event,
    custom: data.custom,
    networkCustom: data.networkCustom
  });

  const rules = [].concat(
    data.aggregatorRules || []
  ).concat(
    data.sourceRules || []
  );

  const evaluateResult = evaluateRules(rules, formattedEvent);

  // evaluation result contains transformed values in tags. these
  // need to be applied on post to aggregating agenda

  /*fs.writeFileSync(
    `${__dirname}/test/fixtures/evaluate.${data.agenda.slug}.${(new Date()).getTime()}.${data.aggregatorAgendaUid}.json`,
    JSON.stringify({
      data,
      aggregatorSchemas,
      rules,
      evaluateResult
    }, null, 2)
  );*/


  // apply rules
  // load aggregator consolidated schema with labels <- why? It is source event that is being evaluated.
  // check if event is already listed in aggregating agenda. if it is, ref source and stop
  // consolidate rules and check against event
  // do transforms required by rules

}
