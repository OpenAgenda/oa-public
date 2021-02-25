'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/agendas/utils/assignState');
const UnauthorizedError = require('../../utils/UnauthorizedError');

function defineState({ agenda, authorizations, isUndrafted, hasEvent }, requestedState) {
  const {
    canChangeState,
    canPublish,
    mustBeModerated
  } = authorizations;

  const agendaDefaultState = agenda?.settings?.contribution?.defaultState;
  const explicitStateRequested = requestedState !== undefined;

  if (isUndrafted && !explicitStateRequested) {
    log('no explicit state requested');
    return agendaDefaultState;
  } else if (isUndrafted) {
    log('event is undrafted');
    return canChangeState ? requestedState : agendaDefaultState;
  }

  if (
    explicitStateRequested
    && (parseInt(requestedState) === 2)
    && !canPublish
  ) {
    throw new UnauthorizedError('agenda', agenda.uid, `not authorized to publish events`);
  }

  if (hasEvent && explicitStateRequested && canChangeState) {
    return requestedState;
  }
  // event exists, is added to agenda. It is a new addition. It should
  // be moderated.
  if (hasEvent && !canChangeState) {
    log('event %s to be moderated', mustBeModerated ? 'needs' : 'does not need');
    return mustBeModerated ? 0 : undefined;
  } else if (hasEvent) {
    return explicitStateRequested ? requestedState : undefined;
  }

  return explicitStateRequested && canChangeState ? requestedState : agendaDefaultState;
}

module.exports = (agenda, event, clean, data, { draft, authorizations }) => {
  const state = draft ? undefined : defineState({
    agenda,
    hasEvent: !!event,
    authorizations,
    isUndrafted: event?.draft,
  }, data.state);

  log('assigning state: %s', state);

  if (state !== undefined) {
    clean.agendaEvent.state = state;
  } else if (!draft) {
    clean.agendaEvent = _.omit(clean.agendaEvent, ['state']);
  }
}
