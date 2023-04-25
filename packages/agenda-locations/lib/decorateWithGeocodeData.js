'use strict';

const log = require('@openagenda/logs')('lib/decorateWithGeocodeData');
const { BadRequest } = require('@openagenda/verror');
const deduceLanguageFromCountry = require('./deduceLanguageFromCountry');

const hasCityAndDept = (g = {}) => (!!g.city && !!g.department) || (!!g.adminLevel4 && !!g.adminLevel2);

async function geocode(interfaces, data) {
  try {
    if (!interfaces.geocode) {
      throw new Error('geocode interface is not set');
    }

    if (!data.address) {
      throw new Error('address is unspecified');
    }

    if (!data.countryCode) {
      throw new Error('countryCode is unspecified');
    }

    const results = await interfaces.geocode(data.address, {
      language: deduceLanguageFromCountry(data.countryCode),
      countryCode: data.countryCode,
    });

    if (!results.length) {
      throw new BadRequest('geocoder didn\'t find address');
    }

    return results[0];
  } catch (e) {
    if (e.name === 'BadRequest') throw e;
    log('error', e.message);
    return {};
  }
}

module.exports = service => Object.assign(async data => {
  if (!data || data.latitude) {
    return data;
  }

  const geocodeResult = await geocode(service.interfaces, data);
  const inseeResult = service.getINSEECode && hasCityAndDept(geocodeResult)
    ? {
      insee: await service.getINSEECode({
        ...geocodeResult,
        region: geocodeResult.region || geocodeResult.adminLevel1,
        department: geocodeResult.department || geocodeResult.adminLevel2,
        city: geocodeResult.city || geocodeResult.adminLevel4,
      }),
    }
    : {};

  return {
    ...geocodeResult,
    ...inseeResult,
    ...data,
  };
}, {
  shouldAttempt: (geocodeIfUndefined, data, isPatch) => {
    if (!geocodeIfUndefined) {
      return false;
    }
    if (!isPatch) {
      return true;
    }
    if (data.address && data.countryCode) {
      return true;
    }
    return false;
  },
});
