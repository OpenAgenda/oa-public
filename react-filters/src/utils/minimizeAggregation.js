const shortKeys = [{
  short: 'm',
  key: 'missing',
}, {
  short: 's',
  key: 'size',
}, {
  short: 't',
  key: 'type',
}, {
  short: 'k',
  key: 'key',
}, {
  short: 'f',
  key: 'field',
}];

const shortValues = [{
  key: 'type',
  short: 'af',
  value: 'additionalFields',
}];

export default function minimizeAggregation(aggregation) {
  if (typeof aggregation === 'string') {
    return aggregation;
  }

  return Object.keys(aggregation).reduce((carry, key) => ({
    ...carry,
    [shortKeys.find(shortKey => shortKey.key === key)?.short ?? key]: shortValues.find(shortValue => (shortValue.key === key) && (aggregation[key] === shortValue.value))?.short ?? aggregation[key],
  }), {});
}
