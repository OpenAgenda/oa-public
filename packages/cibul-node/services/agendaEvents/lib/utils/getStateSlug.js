import states from '@openagenda/agenda-events/iso/states.js';

const { TOCONTROL, CONTROLLED, PUBLISHED } = states;

export default function getStateSlug({ state }) {
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
