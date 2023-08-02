'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/agendas/utils/assignState');
const { Forbidden } = require('@openagenda/verror');

const TYPES = {
  default: 'default',
  requested: 'requested',
  system: 'system'
};

function defineState({
  agenda,
  authorizations,
  isUndrafted,
  hasEvent,
  currentState,
}, requestedState) {
  const {
    canChangeState,
    canPublish,
    mustBeModerated
  } = authorizations;

  const agendaDefaultState = agenda?.settings?.contribution?.defaultState;
  const explicitStateRequested = requestedState !== undefined;

  if (isUndrafted && !explicitStateRequested) {
    log('no explicit state requested%s', isUndrafted ? ', event is undrafted' : '');
    return {
      state: agendaDefaultState,
      type: TYPES.default
    };
  }

  if (isUndrafted) {
    log('event is undrafted');
    return canChangeState ? {
      state: requestedState,
      type: TYPES.requested
    } : {
      state: agendaDefaultState,
      type: TYPES.default
    };
  }

  if (
    explicitStateRequested
    && (parseInt(requestedState, 10) === 2)
    && !canPublish
  ) {
    throw new Forbidden({
      info: { uid: agenda.uid }
    }, 'not authorized to publish events');
  }

  if (hasEvent && explicitStateRequested && canChangeState) {
    return {
      state: requestedState,
      type: TYPES.requested
    };
  }
  // event exists, is added to agenda. It is a new addition. It should
  // be moderated.
  if (hasEvent && !canChangeState) {
    log('event %s to be moderated', mustBeModerated ? 'needs' : 'does not need');
    return mustBeModerated && currentState !== -1 ? {
      state: 0,
      type: TYPES.system
    } : {
      state: undefined,
      type: TYPES.default
    };
  }

  if (hasEvent) {
    return explicitStateRequested ? {
      state: requestedState,
      type: TYPES.requested
    } : {
      state: undefined,
      type: TYPES.default
    };
  }

  return explicitStateRequested && canChangeState ? {
    state: requestedState,
    type: TYPES.requested
  } : {
    state: agendaDefaultState,
    type: TYPES.default
  };
}

module.exports = (agenda, event, clean, data, { draft, authorizations, currentState }) => {
  const { state, type } = draft ? {
    state: undefined,
    type: null
  } : defineState({
    agenda,
    hasEvent: !!event,
    authorizations,
    isUndrafted: event?.draft && !draft,
    currentState,
  }, data.state);

  log('assigning state: %s', state);

  if (state !== undefined) {
    clean.agendaEvent.state = state;
  } else if (!draft) {
    clean.agendaEvent = _.omit(clean.agendaEvent, ['state']);
  }

  return {
    state,
    type
  };
};

module.exports.TYPES = TYPES;
