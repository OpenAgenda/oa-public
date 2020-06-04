export default function mapAggregationsInStats(stats, cb) {
  return stats.map(stat => {
    if (!stat.aggregation) {
      return stat;
    }

    return {
      ...stat,
      aggregation: Array.isArray(stat.aggregation)
        ? stat.aggregation.map(v => cb(v, stat))
        : cb(stat.aggregation, stat)
    };
  });
}
