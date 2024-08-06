import states from '../../iso/states.js';

export default (state) => {
  if (state === 2) {
    return states.PUBLISHED;
  }

  if (state === 1) {
    return states.CONTROLLED;
  }

  if (state === -1) {
    return states.REFUSED;
  }

  return states.TOCONTROL;
};
