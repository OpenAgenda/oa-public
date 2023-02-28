import qs from 'qs';
import filtersToAggregations from '../utils/filtersToAggregations';

export default async function getEvents(
  apiClient,
  jsonExportRes,
  agenda,
  filters,
  query,
  pageParam,
  filtersBase,
  pageSize = 20,
) {
  const params = {
    aggsSizeLimit: 2000,
    aggs: filtersToAggregations(filters, filtersBase),
    from: pageParam > 1 ? (pageParam - 1) * pageSize : undefined,
    ...query,
  };

  const url = jsonExportRes
    .replace(':slug', agenda.slug)
    .replace(':uid', agenda.uid);

  const request = apiClient.get(url, {
    params,
    paramsSerializer: p => qs.stringify(p, { skipNulls: true }),
  });

  return (await request).data;
}
