'use strict';

const axios = require('axios');
const inside = require('point-in-polygon');

async function getPolygonsSet(field, location) {
  const countryCode = (location.countryCode || '').toUpperCase();
  return axios
    .get(
      `https://cdn.openagenda.com/assets/svc/geocoder/${field}/${countryCode}.${location.adminLevel4}.json`,
    )
    .then(({ data }) => data);
}

module.exports = async (field, location) => {
  const set = await getPolygonsSet(field, location).catch(() => null);
  if (!set) {
    return null;
  }
  const { longitude, latitude } = location;
  const matching = set.filter((val) =>
    inside([longitude, latitude], val.polygon));

  if (matching.length) {
    return matching[0][field];
  }

  return null;
};
