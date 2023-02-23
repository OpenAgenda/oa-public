'use strict';

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

module.exports = function cleanRequestedAggregation({ aggsSizeLimit }, aggregation) {
  if (typeof aggregation === 'string') {
    return aggregation;
  }
  const inflated = Object.keys(aggregation).reduce((carry, k) => {
    const key = shortKeys.find(({ short }) => short === k)?.key ?? k;
    const v = aggregation[k];

    return {
      ...carry,
      [key]: shortValues.find(({
        key: itemKey,
        short,
      }) => (itemKey === key) && (short === v))?.value ?? v,
    };
  }, {});

  if (aggsSizeLimit && !inflated.size) {
    inflated.size = aggsSizeLimit;
  }

  return inflated;
};
