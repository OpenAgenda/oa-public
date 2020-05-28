export default function statsToAggregations(stats, { interval } = {}) {
  return stats
    .map(stat => {
      if (!stat.aggregation) {
        return null;
      }

      const addKey = aggregation => ({
        key: `${aggregation.type}-${stat.id}`,
        ...aggregation
      });
      const addInterval = aggregation => (stat.chart.intervalSelector && interval
        ? { ...aggregation, interval }
        : aggregation);

      if (Array.isArray(stat.aggregation)) {
        return stat.aggregation.map(addKey).map(addInterval);
      }

      return addInterval(addKey(stat.aggregation));
    })
    .filter(Boolean)
    .flat();
}
