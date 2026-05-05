export default function applyPrefilterToEventsQuery({
  prefilter,
  query,
  filters,
}) {
  if (!prefilter) {
    return query;
  }

  return Object.entries(query).reduce(
    (result, [key, value]: [string, any]) => {
      const filter = filters.find((v) => v.name === key);

      switch (filter?.type) {
        case 'choice': {
          if (prefilter[key]) {
            result[key] = value.filter((v) => prefilter[key].includes(v));
          } else {
            result[key] = value;
          }
          break;
        }
        case 'dateRange': {
          const queryGte = value.gte ? new Date(value.gte).getTime() : null;
          const queryLte = value.lte ? new Date(value.lte).getTime() : null;
          const prefilterGte = prefilter[key]?.gte
            ? new Date(prefilter[key].gte).getTime()
            : null;
          const prefilterLte = prefilter[key]?.lte
            ? new Date(prefilter[key].lte).getTime()
            : null;
          const tz = prefilter[key]?.tz ?? query.tz ?? null;

          const resultValue: { gte?: string; lte?: string; tz?: 'string' } = {};
          if (queryGte !== null || prefilterGte !== null) {
            resultValue.gte =
              queryGte !== null && prefilterGte !== null
                ? new Date(Math.max(queryGte, prefilterGte)).toISOString()
                : value.gte || prefilter[key].gte;
          }
          if (queryLte !== null || prefilterLte !== null) {
            resultValue.lte =
              queryLte !== null && prefilterLte !== null
                ? new Date(Math.min(queryLte, prefilterLte)).toISOString()
                : value.lte || prefilter[key].lte;
          }
          if (tz) {
            resultValue.tz = tz;
          }
          if (Object.keys(resultValue).length) {
            result[key] = resultValue;
          }
          break;
        }
        case 'numberRange': {
          const queryGte = value.gte ?? null;
          const queryLte = value.lte ?? null;
          const prefilterGte = prefilter[key]?.gte ?? null;
          const prefilterLte = prefilter[key]?.lte ?? null;

          const resultValue: { gte?: number; lte?: number } = {};
          if (queryGte !== null || prefilterGte !== null) {
            resultValue.gte =
              queryGte !== null && prefilterGte !== null
                ? Math.max(queryGte, prefilterGte)
                : value.gte || prefilter[key].gte;
          }
          if (queryLte !== null || prefilterLte !== null) {
            resultValue.lte =
              queryLte !== null && prefilterLte !== null
                ? Math.min(queryLte, prefilterLte)
                : value.lte || prefilter[key].lte;
          }
          if (Object.keys(resultValue).length) {
            result[key] = resultValue;
          }
          break;
        }
        default:
          result[key] = value;
      }

      return result;
    },
    { ...prefilter },
  );
}
