import qs from 'qs';
import VError from '@openagenda/verror';
import filtersToAggregations from '../utils/filtersToAggregations.js';
import getQuerySeparator from '../utils/getQuerySeparator.js';
import NetworkError from './NetworkError.js';

export default async function getEvents(
  _apiClient,
  jsonExportRes,
  agenda,
  filters,
  query,
  pageParam,
  filtersBase,
  pageSize = 20,
  searchMethod = 'get',
) {
  const params = {
    aggsSizeLimit: 1500,
    aggs: filtersToAggregations(filters, filtersBase),
    from: pageParam > 1 ? (pageParam - 1) * pageSize : undefined,
    ...query,
  };

  const url = jsonExportRes
    .replace(':slug', agenda.slug)
    .replace(':uid', agenda.uid);

  const response = await (
    searchMethod === 'get'
      ? fetch(
        `${url}${getQuerySeparator(url)}${qs.stringify(params, {
          skipNulls: true,
        })}`,
      )
      : fetch(url, {
        method: 'post',
        body: JSON.stringify(params),
        headers: {
          'Content-Type': 'application/json',
        },
      })
  ).catch((err) => {
    throw new NetworkError(err, 'Failed to fetch events');
  });

  if (response.ok) return response.json();

  const HttpError = VError[response.status] || VError.GeneralError;

  throw new HttpError(
    {
      meta: {
        method: searchMethod === 'get' ? 'GET' : 'POST',
        url,
      },
      info: {
        statusText: response.statusText,
        agendaUid: agenda.uid,
        agendaSlug: agenda.slug,
        params,
      },
    },
    "Can't list events",
  );
}
