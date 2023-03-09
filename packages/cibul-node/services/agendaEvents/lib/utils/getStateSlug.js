'use strict';

const {
  TOCONTROL,
  CONTROLLED,
  PUBLISHED,
} = require('@openagenda/agenda-events/iso/states');

module.exports = function getStateSlug({ state }) {
  if (state === TOCONTROL) {
    return 'tocontrol';
  }
  if (state === CONTROLLED) {
    return 'controlled';
  }
  if (state === PUBLISHED) {
    return 'published';
  }
};
