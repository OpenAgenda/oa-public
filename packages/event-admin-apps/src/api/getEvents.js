import qs from 'qs';

export default async function getEvents(
  apiClient,
  jsonExportRes,
  agenda,
  filters,
  query,
  pageParam
) {
  const aggregations = filters
    .map(filter => ({
      key: `${filter.name}-${filter.id}`,
      type: filter.name,
      ...filter.aggregation,
    }))
    .filter(Boolean)
    .flat();

  const params = {
    oaq: { passed: 1 },
    // size: 0,
    aggregations,
    searchAfter: pageParam,
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
