'use strict';

const log = require('@openagenda/logs')('lib/decorateWithGeocodeData');
const deduceLanguageFromCountry = require('./deduceLanguageFromCountry');

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
      countryCode: data.countryCode
    });

    if (!results.length) {
      return {};
    }

    return results[0];
  } catch (e) {
    log('error', e.message);
    return {};
  }
}

module.exports = service => async data => {
  if (!data || data.latitude) {
    return;
  }

  const geocodeResult = await geocode(service.interfaces, data);
  const inseeResult = service.getINSEECode ? {
    insee: await service.getINSEECode(geocodeResult)
  } : {};

  return {
    ...geocodeResult,
    ...inseeResult,
    ...data
  }
}
