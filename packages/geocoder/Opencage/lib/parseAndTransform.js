import _ from 'lodash';
import getPolygonField from './getPolygonField.js';
import applyTransforms from './applyTransforms.js';
import completeData from './completeData.js';

async function _applyTransformsOnGeocodeItem(geocodeResult) {
  const updated = applyTransforms(geocodeResult);

  const adminLevel6 = await getPolygonField('adminLevel6', updated);

  if (adminLevel6) {
    updated.adminLevel6 = adminLevel6;
  }

  return updated;
}

async function _applyTransforms(geocodeResults) {
  if (!geocodeResults.length) return geocodeResults;

  return Promise.all(geocodeResults.map(_applyTransformsOnGeocodeItem));
}

function parseItem(item) {
  return {
    address: _.get(item, 'formatted'),
    adminLevel1: _.get(item, 'components.state', null),
    adminLevel2: _.get(
      item,
      'components.state_district',
      _.get(item, 'components.county', null),
    ),
    adminLevel3: item?.components?.local_authority,
    adminLevel4: _.get(
      item,
      'components.town',
      _.get(item, 'components.city', _.get(item, 'components.village', null)),
    ),
    adminLevel5: _.get(
      item,
      'components.borough',
      _.get(item, 'components.suburb', null),
    ),
    adminLevel6: _.get(
      item,
      'components.city_block',
      _.get(item, 'components.suburb', _.get(item, 'components.city_district')),
    ),
    postalCode: _.get(item, 'components.postcode', null),
    timezone: _.get(item, 'annotations.timezone.name', null),
    latitude: _.get(item, 'geometry.lat', null),
    longitude: _.get(item, 'geometry.lng', null),
    country: _.get(item, 'components.country', null),
    countryCode: _.get(item, 'components.country_code', null),
  };
}

function parseAndTransform(geoTree) {
  return async (items, options = {}) => {
    const { raw = false } = options;
    // premier traitement du résultat opencagedata
    const parsedItems = items.map((item) => {
      const parsed = parseItem(item);
      if (raw) {
        parsed.raw = item;
      }
      return parsed;
    });

    // application de correctifs
    const transformed = await _applyTransforms(parsedItems);

    // compléter les données
    const completed = transformed.map((item) => completeData(item, geoTree));
    return completed;
  };
}

export default parseAndTransform;
