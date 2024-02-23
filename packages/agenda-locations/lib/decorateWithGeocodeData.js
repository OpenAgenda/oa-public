'use strict';

const log = require('@openagenda/logs')('lib/decorateWithGeocodeData');
const { BadRequest } = require('@openagenda/verror');
const deduceLanguageFromCountry = require('./deduceLanguageFromCountry');

const hasCityAndDept = (g = {}) => (!!g.city && !!g.department) || (!!g.adminLevel4 && !!g.adminLevel2);

function isDefinedAndDifferent(data, current, field) {
  return data[field] && data[field] !== current?.[field];
}

function incompleteAdminLevels(current) {
  if (!current) {
    return true;
  }
  const { adminLevel1 = false, adminLevel2 = false, adminLevel4 = false } = current;
  return !(adminLevel1 && adminLevel2 && adminLevel4);
}

async function geocode(interfaces, data, current) {
  const geocodeData = { ...current, ...data };
  try {
    if (!interfaces.geocode) {
      throw new Error('geocode interface is not set');
    }

    if (!geocodeData.address) {
      throw new Error('address is unspecified');
    }

    if (!geocodeData.countryCode) {
      throw new Error('countryCode is unspecified');
    }

    const results = await interfaces.geocode(geocodeData.address, {
      language: deduceLanguageFromCountry(geocodeData.countryCode),
      countryCode: geocodeData.countryCode,
    });

    if (!results.length) {
      throw new BadRequest('geocoder didn\'t find address');
    }

    return results[0];
  } catch (e) {
    if (e.name === 'BadRequest') throw e;
    log.error(e);
    return {};
  }
}

async function reverseGeocode(interfaces, data, current) {
  const reverseGeocodeData = { ...current, ...data };
  try {
    if (!interfaces.geocode.reverse) {
      throw new Error('reverseGeocode interface is not set');
    }

    if (!reverseGeocodeData.latitude) {
      throw new Error('latitude is unspecified');
    }

    if (!reverseGeocodeData.longitude) {
      throw new Error('longitude is unspecified');
    }

    const results = await interfaces.geocode.reverse(reverseGeocodeData.latitude, reverseGeocodeData.longitude);

    if (!results.length) {
      throw new BadRequest('geocoder didn\'t find address');
    }

    return results[0];
  } catch (e) {
    if (e.name === 'BadRequest') throw e;
    log.error(e);
    return {};
  }
}

async function getGeocodeData(interfaces, data, current) {
  if (isDefinedAndDifferent(data, current, 'address') || isDefinedAndDifferent(data, current, 'countryCode')) {
    return geocode(interfaces, data, current);
  }

  if (isDefinedAndDifferent(data, current, 'latitude') || isDefinedAndDifferent(data, current, 'longitude')) {
    return reverseGeocode(interfaces, data, current);
  }

  if (incompleteAdminLevels({ ...current, ...data })) {
    return reverseGeocode(interfaces, data, current);
  }
  return {};
}

module.exports = service => Object.assign(async (data, current = {}) => {
  if (!data && !incompleteAdminLevels(current)) {
    return data;
  }
  const geocodeResult = await getGeocodeData(service.interfaces, data, current);

  const inseeResult = service.getINSEECode && hasCityAndDept(geocodeResult) && { ...current, ...data, ...geocodeResult }.countryCode === 'FR'
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
    ...current,
    ...geocodeResult,
    ...inseeResult,
    ...data,
  };
}, {
  shouldAttempt: (autocomplete, data, isPatch, current = {}) => {
    if (!autocomplete) {
      return false;
    }
    if (!isPatch) {
      return true;
    }

    if (incompleteAdminLevels(current)) {
      return true;
    }

    if (data?.address || data?.countryCode) {
      return true;
    }
    if (data?.latitude || data?.longitude) {
      return true;
    }
    return false;
  },
});
