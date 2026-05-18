import logger from '@openagenda/logs';
import { BadRequest } from '@openagenda/verror';
import addressValidator from '../validators/address.js';
import deduceLanguageFromCountry from './deduceLanguageFromCountry.js';

const log = logger('lib/decorateWithGeocodeData');

const hasCityAndDept = (g = {}) =>
  (!!g.city && !!g.department) || (!!g.adminLevel4 && !!g.adminLevel2);

function isDefinedAndDifferent(data, current, field) {
  return data[field] && data[field] !== current?.[field];
}

function addAdminLevels(data) {
  const {
    adminLevel1,
    adminLevel2,
    adminLevel3,
    adminLevel4,
    adminLevel5,
    adminLevel6,
  } = data;
  return {
    ...data,
    region: adminLevel1 || data.region,
    department: adminLevel2 || data.department,
    adminLevel3,
    city: adminLevel4 || data.city,
    adminLevel5,
    district: adminLevel6 || data.district,
  };
}

function incompleteAdminLevels(current) {
  if (!current) {
    return true;
  }
  const {
    adminLevel1 = false,
    adminLevel2 = false,
    adminLevel4 = false,
  } = current;
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

    const validateAddress = addressValidator({ field: 'address' });
    validateAddress(geocodeData.address);

    const results = await interfaces.geocode(geocodeData.address, {
      language: deduceLanguageFromCountry(geocodeData.countryCode),
      countryCode: geocodeData.countryCode,
    });

    if (!results.length) {
      throw new BadRequest("geocoder didn't find address");
    }

    return results[0];
  } catch (e) {
    if (e.name === 'BadRequest') throw e;
    if (Array.isArray(e)) {
      throw new BadRequest({ info: { errors: e } }, 'data is invalid');
    }
    log.warn(e);
    return {};
  }
}

async function reverseGeocode(interfaces, data, current) {
  const reverseGeocodeData = { ...current, ...data };
  try {
    if (!interfaces.reverseGeocode) {
      throw new Error('reverseGeocode interface is not set');
    }

    if (!reverseGeocodeData.latitude) {
      throw new Error('latitude is unspecified');
    }

    if (!reverseGeocodeData.longitude) {
      throw new Error('longitude is unspecified');
    }

    const results = await interfaces.reverseGeocode(
      reverseGeocodeData.latitude,
      reverseGeocodeData.longitude,
    );

    if (!results.length) {
      throw new BadRequest("geocoder didn't find address");
    }

    const { latitude, longitude, ...rest } = results[0];
    return rest;
  } catch (e) {
    if (e.name === 'BadRequest') throw e;
    log.warn(e);
    return {};
  }
}

async function getGeocodeData(interfaces, data, current) {
  if (
    isDefinedAndDifferent(data, current, 'latitude')
    || isDefinedAndDifferent(data, current, 'longitude')
  ) {
    return reverseGeocode(interfaces, data, current);
  }

  if (
    isDefinedAndDifferent(data, current, 'address')
    || isDefinedAndDifferent(data, current, 'countryCode')
  ) {
    return geocode(interfaces, data, current);
  }

  if (incompleteAdminLevels({ ...current, ...data })) {
    return reverseGeocode(interfaces, data, current);
  }
  return {};
}

export default (service) =>
  Object.assign(
    async (pdata, current = {}) => {
      const data = addAdminLevels(pdata);

      if (!data && !incompleteAdminLevels(current)) {
        return data;
      }
      const geocodeResult = await getGeocodeData(
        service.interfaces,
        data,
        current,
      );

      const inseeResult = service.getINSEECode
        && hasCityAndDept(geocodeResult)
        && { ...current, ...geocodeResult, ...data }.countryCode === 'FR'
        ? {
          insee: await service.getINSEECode({
            ...geocodeResult,
            region: geocodeResult.region || geocodeResult.adminLevel1,
            department:
                  geocodeResult.department || geocodeResult.adminLevel2,
            city: geocodeResult.city || geocodeResult.adminLevel4,
          }),
        }
        : {};

      return {
        ...current,
        ...geocodeResult,
        ...inseeResult,
        ...JSON.parse(JSON.stringify(data)),
      };
    },
    {
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
    },
  );
