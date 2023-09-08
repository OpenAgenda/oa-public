import axios from 'axios';

const {
  PASS_API_DOMAIN: domain,
} = process.env;

const headers = apiKey =>  ({
  'accept': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
});

async function listEventOfferCategories() {
  const openAPIObj = await axios({
    method: 'get',
    url: `${domain}/public/offers/v1/event/openapi.json`
  }).then(r => r.data);

  const categoriesSchemas = openAPIObj.components.schemas['EventOfferCreation'].properties.categoryRelatedFields.discriminator.mapping;
    
  return Object.keys(categoriesSchemas).map(code => {
    return ({
      code,
      label: openAPIObj.components.schemas[categoriesSchemas[code].split('/').pop()].description,
    });
  });
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