'use strict';

const config = require("../config");

module.exports = (map, state, nav, hooks, onUpdate) => {
  map.utils.setOnBoundsChangeEnd(map, () => {
    nav.sync(map.utils.getBounds(map));

    if (state.selectedEvent) {
      return;
    }

    if (state.enabled && state.auto) {
      onUpdate()
    }

    if (hooks.onBoundsChange) {
      hooks.onBoundsChange(map.utils.getMapCorners(map));
    }
  });
}