import qs from 'qs';
import filtersToAggregations from '../utils/filtersToAggregations';

export default async function getEvents(
  _apiClient,
  jsonExportRes,
  agenda,
  filters,
  query,
  pageParam,
  filtersBase,
  pageSize = 20,
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

  return fetch(`${url}?${qs.stringify(params, { skipNulls: true })}`).then(
    r => {
      if (r.ok) return r.json();
      throw new Error("Can't list events");
    },
  );
}
