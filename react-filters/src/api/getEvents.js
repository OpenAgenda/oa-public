import qs from 'qs';

const PAGE_SIZE = 20;

export default async function getEvents(
  apiClient,
  jsonExportRes,
  agenda,
  filters,
  query,
  pageParam
) {
  const aggregations = filters
    .map(filter => {
      if (filter.aggregation === null) {
        return false;
      }

      return {
        key: filter.name,
        type: filter.name,
        ...filter.aggregation,
      };
    })
    .filter(Boolean)
    .flat();

  const params = {
    // oaq: { passed: 1 },
    // size: 0,
    aggregations,
    from: pageParam > 1 ? (pageParam - 1) * PAGE_SIZE : undefined,
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
