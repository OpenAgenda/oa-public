'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('core/utils/assignState');
const UnauthorizedError = require('../../utils/UnauthorizedError');

const canPublish = (agenda, access) => (
  agenda?.settings?.contribution?.canPublish
  || ['administrators', 'moderators']
).map(v => v.replace(/s$/, '')).includes(access);

function defineState(agenda, current, clean, data, { access, draft }) {
  const isUndrafted = current?.draft && !draft;
  const canChangeState = !['contributor', 'reader', 'public'].includes(access);
  const explicitStateRequested = data.state !== undefined;
  const agendaDefault = agenda?.settings?.contribution?.defaultState;

  log('agenda default state set at %s, access to change state is %s for %s event',
    agendaDefault,
    canChangeState ? 'given' : 'not given',
    isUndrafted ? 'undrafted' : (current ? 'existing' : 'new or added')
  );

  if (draft) {
    log('is draft, no state to specify');
    return undefined;
  }

  if (isUndrafted && !explicitStateRequested) {
    log('no explicit state requested');
    return agendaDefault;
  } else if (isUndrafted) {
    log('event is undrafted');
    return canChangeState ? data.state : agendaDefault;
  }

  if (
    explicitStateRequested
    && (parseInt(data.state) === 2)
    && !canPublish(agenda, access)
  ) {
    throw new UnauthorizedError('agenda', agenda.uid, `${access} is not authorized to publish events`);
  }

  if (current && explicitStateRequested && canChangeState) {
    return data.state;
  }
  // event exists, is added to agenda. It is a new addition. It should
  // be moderated.
  if (current && !canChangeState) {
    const shouldBeModerated = (agenda?.settings?.contribution?.moderateOnChangeBy || []).includes(access);
    log('event %s to be moderated', shouldBeModerated ? 'needs' : 'does not need');
    return shouldBeModerated ? 0 : undefined;
  } else if (current) {
    return explicitStateRequested ? data.state : undefined;
  }

  return explicitStateRequested && canChangeState ? data.state : agendaDefault;
}

module.exports = (agenda, current, clean, data, { access, draft }) => {
  const state = defineState(agenda, current, clean, data, {
    access,
    draft
  });

  log('assigning state: %s', state);

  if (state !== undefined) {
    clean.agendaEvent.state = state;
  } else {
    clean.agendaEvent = _.omit(clean.agendaEvent, ['state']);
  }
}
