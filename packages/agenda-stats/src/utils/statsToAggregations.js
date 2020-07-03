export default function statsToAggregations(stats) {
  return stats
    .map(stat => (stat.aggregation
      ? {
        key: `${stat.aggregation.type}-${stat.id}`,
        interval: stat.state.interval,
        size: stat.state.size,
        ...stat.aggregation
      }
      : null))
    .filter(Boolean)
    .flat();
}
