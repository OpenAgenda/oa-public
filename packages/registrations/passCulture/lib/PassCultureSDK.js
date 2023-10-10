import _ from 'lodash';
import axios from 'axios';
import typeLabels from './typeLabels.json';

const {
  PASS_API_DOMAIN: domain,
} = process.env;

const headers = apiKey =>  ({
  'accept': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
});

const labelizeENUMValue = value => {
  if (typeLabels[value]) {
    return typeLabels[value];
  }
  return value.split('-').map(p => _.capitalize(p).replace(/_/g, ' ')).join(' - ')
}

function extractSchemaOptions(openAPIObj, schema, key, relatedKey) {
  const relatedSchemas = openAPIObj.components.schemas[schema].properties[relatedKey].discriminator.mapping;

  return Object.keys(relatedSchemas).map(value => {
    const obj = openAPIObj.components.schemas[relatedSchemas[value].split('/').pop()];

    return ({
      value,
      label: obj.description,
      related: obj.required
      .filter(r => r !== key)
      .map(r => obj.properties[r]['$ref'].split('/').pop())
    });
  });
}

async function listEventOfferCategories() {
  const openAPIObj = await axios({
    method: 'get',
    url: `${domain}/public/offers/v1/event/openapi.json`
  }).then(r => r.data);

  const categories = extractSchemaOptions(openAPIObj, 'EventOfferCreation', 'category', 'categoryRelatedFields');

  const related = categories.reduce((r, category) => r.concat(
    category.related.filter(item => !r.includes(item))
  ), []).map(r => ({
    schema: r,
    options: openAPIObj.components.schemas[r].enum.map(value => ({
      value,
      label: labelizeENUMValue(value),
    })),
  }));

  return {
    categories,
    related
  };
}

function call(apiKey, method, path, data = {}) {
  return axios({
    method,
    url: `${domain}/${path}`,
    headers: headers(apiKey),
    ...(method === 'get' ? { params: data } : { data }),
  }).then(r => r.data);
}

export default function PassCultureSDK(key) {
  return {
    offers: {
      events: Object.assign(eventId => ({
        get: call.bind(null, key, 'get', `/public/offers/v1/events/${eventId}`),
        priceCategories: Object.assign(categoryId => ({
          patch: call.bind(null, key, 'patch', `/public/offers/v1/events/${eventId}/price_categories/${categoryId}`),
        }), {
          create: call.bind(null, key, 'post', `/public/offers/v1/events/${eventId}/price_categories`),
        }),
        dates: Object.assign(dateId => ({
          get: call.bind(null, key, 'get', `/public/offers/v1/events/${eventId}/dates/${dateId}`),
          patch: call.bind(null, key, 'patch', `/public/offers/v1/events/${eventId}/dates/${dateId}`),
        }), {
          list: call.bind(null, key, 'get', `/public/offers/v1/events/${eventId}/dates`),
          create: call.bind(null, key, 'post', `/public/offers/v1/events/${eventId}/dates`),
        }),
      }), {
        list: call.bind(null, key, 'get', '/public/offers/v1/events'),
        create: call.bind(null, key, 'post', '/public/offers/v1/events'),
        categories: {
          list: listEventOfferCategories,
        }
      }),
      offererVenues: call.bind(null, key, 'get', '/public/offers/v1/offerer_venues'),
    },
  }
}