import defaultStatConfigs from '../common/defaultStatConfigs';

function completeAggregation(stat) {
  const aggType = stat.aggregation.type;
  const opt = aggType === 'additionalFields'
    ? { fieldSchema: stat.state.fieldSchema }
    : {};
  const defaultConfig = typeof defaultStatConfigs[aggType] === 'function'
    ? defaultStatConfigs[aggType](opt)
    : defaultStatConfigs[aggType];

  return {
    key: `${aggType}-${stat.id}`,
    interval: stat.state.interval,
    size: stat.state.size,
    ...defaultConfig?.aggregation,
    ...stat.aggregation
  };
}

export default function statsToAggregations(stats) {
  return stats
    .map(stat => (stat.aggregation ? completeAggregation(stat) : null))
    .filter(Boolean)
    .flat();
}
