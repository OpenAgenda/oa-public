import states from '@openagenda/agenda-events/iso/states.js';

const { TOCONTROL, CONTROLLED, PUBLISHED, REFUSED } = states;

export default function getStateSlug({ state }) {
  if (state === REFUSED) {
    return 'refused';
  }
  if (state === TOCONTROL) {
    return 'tocontrol';
  }
  if (state === CONTROLLED) {
    return 'controlled';
  }
  if (state === PUBLISHED) {
    return 'published';
  }
}
