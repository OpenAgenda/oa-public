'use strict';

const log = require('@openagenda/logs')('duplicates');
const getDistances = require('./getDistances');

module.exports = (location1, location2, config) => {
  const { weights, scoreThreshold } = config;
  const distances = getDistances(location1, location2);
  const score = distances.geoDistance * weights.geo + distances.levensteinName * weights.levensteinName;
  const sameExtId = location1.extId && location2.extId ? location1.extId === location2.extId : false;
  if (score < scoreThreshold || sameExtId) {
    log({
      ref: {
        uid: location1.uid,
        name: location1.name,
      },
      candidate: {
        uid: location2.uid,
        name: location2.name,
      },
      distances: {
        geoDistance: distances.geoDistance,
        levensteinName: distances.levensteinName,
      },
      score,
      sameExtId,
    });
    return true;
  }
  return false;
};
