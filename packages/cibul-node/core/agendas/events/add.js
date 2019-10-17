"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );
const events = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/add' );

const doAdd = require( '../utils/doAdd' );
const getAgendaWithNetworkAndSchemas = require( '../utils/getAgendaWithNetworkAndSchemas' );
const validate = require( './validate' );

module.exports = async (agendaUid, eventUid, data, options = {}) => {
  log('adding event %s to agenda %s', eventUid, agendaUid);

  const {
    aggregated,
    sourceAgenda,
    batched
  } = Object.assign({
    aggregated: false,
    sourceAgenda: null,
    batched: false
  }, options || {});

  const agenda = await getAgendaWithNetworkAndSchemas(agendaUid);

  // pre-validate data
  const clean = await validate.loaded({
    formSchema: agenda.formSchema,
    networkFormSchema: _.get(agenda, 'network.formSchema')
  }, data, {
    evaluateEvent: false,
    sourceAgenda,
    aggregated
  });

  // if event is already referenced on agenda, this fails
  if (await agendaEvents(agendaUid).get(eventUid)) {
    throw new VError('event %s is already referenced by agenda %s', eventUid, agendaUid);
  }

  const event = await events.get({
    uid: eventUid
  }, {
    internal: true,
    detailed: true
  });

  return doAdd(agenda, event, clean, {
    batched,
    aggregated,
    sourceAgenda
  });
}
