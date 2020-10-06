'use strict';

const log = require('@openagenda/logs')('lib/geocode');

const deduceLanguageFromCountry = require('./deduceLanguageFromCountry');

module.exports = async (interfaces, data) => {
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
      return null;
    }

    return results[0];
  } catch (e) {
    log('error', e.message);
    return null;
  }
}
