export default function statsToAggregations(stats) {
  return stats
    .map(stat => stat.aggregation)
    .filter(Boolean)
    .flat();
}
