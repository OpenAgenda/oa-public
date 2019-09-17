"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );
const events = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/add' );

const doAdd = require( '../utils/doAdd' );
const getAgendaWithNetworkAndSchemas = require( '../utils/getAgendaWithNetworkAndSchemas' );
const validate = require( './validate' );

module.exports = async (agendaUid, eventUid, data) => {
  log('adding event %s to agenda %s', eventUid, agendaUid);
  const agenda = await getAgendaWithNetworkAndSchemas(agendaUid);

  // pre-validate data
  const clean = await validate.loaded({
    formSchema: agenda.formSchema,
    networkFormSchema: _.get( agenda, 'network.formSchema' )
  }, data, false);

  // if event is already referenced on agenda, this fails
  if (await agendaEvents(agendaUid).get(eventUid)) {
    throw new VError('event %s is already referenced by agenda %s', eventUid, agendaUid);
  }

  const event = await events.get({ uid: eventUid }, { internal: true, detailed: true });

  log(clean);
  return doAdd(agenda, eventUid, clean, {
    context: {
      event,
      agenda
    }
  });
}
