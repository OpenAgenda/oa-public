'use strict';

const _ = require('lodash');
const levenshtein = require('fast-levenshtein');

function getDistance(l1, l2) {
  const R = 6371e3;
  const radlat1 = (Math.PI * l1.latitude) / 180;
  const radlat2 = (Math.PI * l2.latitude) / 180;
  const Δφ = ((l2.latitude - l1.latitude) * Math.PI) / 180;
  const Δλ = ((l2.longitude - l1.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
    + Math.cos(radlat1) * Math.cos(radlat2)
    * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = (location1, location2) => {
  const levensteinName = levenshtein.get(location1.name, location2.name);
  const geoDistance = getDistance(
    _.pick(location1, ['latitude', 'longitude']),
    _.pick(location2, ['latitude', 'longitude'])
  );

  return { geoDistance, levensteinName };
};
