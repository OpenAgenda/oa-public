function completeAggregation(stat) {
  return {
    key: `${stat.aggregation.type}-${stat.id}`,
    interval: stat.state.interval,
    size: stat.state.size,
    ...stat.aggregation,
  };
}

export default function statsToAggregations(stats) {
  return stats
    .map(stat => (stat.aggregation ? completeAggregation(stat) : null))
    .filter(Boolean)
    .flat();
}
