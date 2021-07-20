'use strict';

const log = require('@openagenda/logs')('duplicates');
const getDistances = require('./getDistances');

const isNullIsland = location => {
  if (!location.latitude && !location.longitude) {
    return true;
  }
  return false;
};

module.exports = (location1, location2, config) => {
  const sameExtId = location1.extId && location2.extId ? location1.extId === location2.extId : false;
  if (sameExtId) {
    log('info', {
      ref: {
        uid: location1.uid,
        name: location1.name,
      },
      candidate: {
        uid: location2.uid,
        name: location2.name,
      },
      sameExtId
    });
    return true;
  }
  const { nameDistanceThreshold, geoThreshold } = config;
  const distances = getDistances(location1, location2);
  if ((distances.jaroName < nameDistanceThreshold && distances.geoDistance < geoThreshold)) {
    log('info', {
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
        levenshteinPercent: distances.levenshteinPercent,
        jaro: distances.jaroName,
      },
    });
    if (isNullIsland(location1) || isNullIsland(location2)) {
      if (distances.jaroName < nameDistanceThreshold / 2) return true;
      return false;
    }
    return true;
  }
  return false;
};
