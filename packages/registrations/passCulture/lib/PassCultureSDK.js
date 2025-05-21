import * as url from 'node:url';
import { readFile } from 'node:fs/promises';
import _ from 'lodash';
import axios from 'axios';
import { extractSchemaOptions } from './utils.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const typeLabels = await readFile(`${__dirname}/typeLabels.json`, 'utf8').then(
  JSON.parse,
);

const headers = (apiKey) => ({
  accept: 'application/json',
  Authorization: `Bearer ${apiKey}`,
});

const labelizeENUMValue = (value) => {
  if (typeLabels[value]) {
    return typeLabels[value];
  }
  return value
    .split('-')
    .map((p) => _.capitalize(p).replace(/_/g, ' '))
    .join(' - ');
};

async function listEventOfferCategories({ api }) {
  const openAPIObj = await axios({
    method: 'get',
    url: `${api}/openapi.json`,
  }).then((r) => r.data);

  const categories = extractSchemaOptions(
    openAPIObj,
    'EventOfferCreation',
    'category',
    'categoryRelatedFields',
  );

  const related = categories
    .reduce(
      (r, category) =>
        r.concat(category.related.filter((item) => !r.includes(item))),
      [],
    )
    .map((r) => ({
      schema: r.replace('__deprecated_', ''),
      options: openAPIObj.components.schemas[r].enum.map((value) => ({
        value,
        label: labelizeENUMValue(value),
      })),
    }));

  return {
    categories: categories.map((c) => ({
      ...c,
      related: c.related.map((r) => r.replace('__deprecated_', '')),
    })),
    related,
  };
}

function call({ key, api }, method, path, data) {
  return axios({
    method,
    url: `${api}${path}`,
    headers: headers(key),
    ...method === 'get' ? { params: data ?? {} } : { data },
  }).then((response) => response.data);
}

export default function PassCultureSDK(params) {
  return {
    offers: {
      events: Object.assign(
        (eventId) => ({
          getLink: () => params.offerLink.replace(':id', eventId),
          get: call.bind(
            null,
            params,
            'get',
            `/public/offers/v1/events/${eventId}`,
          ),
          patch: call.bind(
            null,
            params,
            'patch',
            `/public/offers/v1/events/${eventId}`,
          ),
          priceCategories: Object.assign(
            (categoryId) => ({
              patch: call.bind(
                null,
                params,
                'patch',
                `/public/offers/v1/events/${eventId}/price_categories/${categoryId}`,
              ),
            }),
            {
              create: call.bind(
                null,
                params,
                'post',
                `/public/offers/v1/events/${eventId}/price_categories`,
              ),
            },
          ),
          dates: Object.assign(
            (dateId) => ({
              get: call.bind(
                null,
                params,
                'get',
                `/public/offers/v1/events/${eventId}/dates/${dateId}`,
              ),
              patch: call.bind(
                null,
                params,
                'patch',
                `/public/offers/v1/events/${eventId}/dates/${dateId}`,
              ),
              delete: call.bind(
                null,
                params,
                'delete',
                `/public/offers/v1/events/${eventId}/dates/${dateId}`,
              ),
            }),
            {
              list: call.bind(
                null,
                params,
                'get',
                `/public/offers/v1/events/${eventId}/dates`,
              ),
              create: call.bind(
                null,
                params,
                'post',
                `/public/offers/v1/events/${eventId}/dates`,
              ),
            },
          ),
          bookings: {
            list: (extraParams = {}) =>
              call(params, 'get', '/public/bookings/v1/bookings', {
                offerId: eventId,
                ...extraParams,
              }),
          },
        }),
        {
          list: call.bind(null, params, 'get', '/public/offers/v1/events'),
          create: call.bind(null, params, 'post', '/public/offers/v1/events'),
          categories: {
            list: listEventOfferCategories.bind(null, params),
          },
        },
      ),
      offererVenues: call.bind(
        null,
        params,
        'get',
        '/public/offers/v1/offerer_venues',
      ),
      addresses: Object.assign(
        (addressesId) => ({
          get: call.bind(
            null,
            params,
            'get',
            `/public/offers/adressesId/${addressesId}`,
          ),
        }),
        {
          search: call.bind(
            null,
            params,
            'get',
            '/public/offers/v1/addresses/search',
          ),
          create: call.bind(
            null,
            params,
            'post',
            '/public/offers/v1/addresses',
          ),
        },
      ),
    },
  };
}
