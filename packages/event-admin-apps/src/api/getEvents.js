export default async function getEvents(
  apiClient,
  jsonExportRes,
  agenda,
  filters,
  query,
  pageParam
) {
  console.log('getEvents', pageParam);

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
    ...query,
    sort: 'updatedAt.desc',
    detailed: true,
    searchAfter: pageParam,
  };

  const url = jsonExportRes
    .replace(':slug', agenda.slug)
    .replace(':uid', agenda.uid);

  return (await apiClient.get(url, { params })).data;
}
