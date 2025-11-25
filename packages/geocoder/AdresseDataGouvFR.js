import _ from 'lodash';
import ky from 'ky';

const forwardURL = (query) =>
  `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}`;

const detailedURL = (latitude, longitude) =>
  `https://geo.api.gouv.fr/communes?lat=${latitude}&lon=${longitude}&fields=region,departement`;

async function reverse(latitude, longitude) {
  return { latitude, longitude };
}

function parseResponseItem({ raw }, item) {
  const parsed = {
    address: _.get(item, 'properties.label'),
    city: _.get(item, 'properties.city'),
    postalCode: _.get(item, 'properties.postcode'),
    insee: _.get(item, 'properties.citycode'),
    latitude: _.get(item, 'geometry.coordinates[1]'),
    longitude: _.get(item, 'geometry.coordinates[0]'),
  };

  if (raw) parsed.raw = item;

  return parsed;
}

async function geocode(query, { raw, first }) {
  const data = await ky(forwardURL(query)).json();
  const features = _.get(data, 'features', []);

  const results = features.map(parseResponseItem.bind(null, { raw }));

  return first ? _.first(results) : results;
}

async function detailed(query, options = {}) {
  const { raw } = options || {};

  const result = await geocode(query, { raw, first: true });
  if (!_.get(result, 'insee')) return result;

  const details = await ky(
    detailedURL(result.latitude, result.longitude),
  ).json();
  if (!details) return result;

  _.assign(result, {
    department: _.get(details, '0.departement.nom'),
    region: _.get(details, '0.region.nom'),
  });

  if (raw) result.rawDetails = details;

  return result;
}

export default () =>
  _.assign(geocode.bind(null), {
    detailed: detailed.bind(null),
    reverse: reverse.bind(null),
  });
