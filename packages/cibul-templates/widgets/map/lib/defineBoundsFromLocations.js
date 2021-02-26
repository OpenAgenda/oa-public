'use strict';

module.exports = (mapUtils, locations, includePassed = false) => {
  const locationUids = Object.keys(locations);

  if (!locationUids.length) return null;

  locationUids.forEach(uid => {
    const location = locations[uid];
    if (!includePassed && location.passed) {
      return;
    };
    if (b) {
      mapUtils.extendBounds(b, location.coords);
    } else {
      b = mapUtils.createBounds(location.coords);
    }
  });

  return b || mapUtils.createBounds(locations[locationUids.pop()].coords);
};