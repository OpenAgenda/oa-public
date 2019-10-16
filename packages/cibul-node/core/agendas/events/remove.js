"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const agendas = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );
const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const agendaEvents = require( '@openagenda/agenda-events' );

const aggregators = require('../../../services/aggregator').instance;
const getAgenda = require( '../utils/getAgenda' );
const merge = require('../utils/merge');

const log = require('@openagenda/logs')('core/agendas/events/remove');

module.exports = async (agendaUid, eventUid, options) => {
  log('removing event %s from agenda %s', eventUid, agendaUid, options);
  const contextUserUid = _.get(options, 'context.userUid');

  const {
    batched
  } = {
    batched: false,
    ...(options || {})
  };

  const agenda = await getAgenda(agendaUid);

  const {
    formSchemaId
  } = agenda;

  const removed = {
    event: false,
    agendaEvent: false,
    custom: false
  };

  const event = await events.get({ uid: eventUid }, {
    private: null,
    internal: true
  });

  if (!event) {
    throw new VError('event of uid %s not found', eventUid);
  }

  const deletion = event.agendaUid === parseInt(agendaUid);

  if (!event.draft) {
    const result = await agendaEvents(agendaUid).remove(eventUid, {
      transferToLegacy: true,
      context: {
        agendaUid,
        userUid: contextUserUid,
        legacy: false,
        deletion,
        batched
      }
    });

    if (result.success) {
      removed.agendaEvent = result.removed;
    }
  }

  if (formSchemaId) {
    const result = await custom(formSchemaId).remove(eventUid, {
      transferToLegacy: !event.draft,
      context: {
        agendaUid,
        userUid: contextUserUid,
        legacy: false
      }
    } );

    if (result.success) {
      removed.custom = result.removed;
    }
  }

  const remaining = await agendaEvents.list.byEventUid(eventUid);

  log('there are %s remaining agenda references', remaining.total);
  log('agenda %s event origin agenda', event.agendaUid === parseInt(agendaUid) ? 'is' : 'is not');

  if (!remaining.total || deletion) {
    const result = await events.remove({
      uid: eventUid
    }, {
      agendaUid,
      userUid: contextUserUid,
      transferToLegacy: !event.draft
    });

    if (result.success) {
      removed.event = result.event;
    }
  }

  if (!event.draft) {
    await aggregators.notify('removeEvent', {
      event: merge.event(event, removed.agendaEvent, removed.custom),
      agenda,
      batched
    });
  }

  return {
    success: true,
    removed
  };
}
