'use strict';

module.exports = [
  {
    aggregation: {
      type: 'timings'
    },
    chart: {
      type: 'horizontal',
      intervalSelector: true,
      dataKey: 'timingCount',
      labelKey: 'key',
      tooltip: 'date',
      categoryTick: 'date'
    }
  },
  {
    aggregation: {
      type: 'keywords'
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'key',
      loadMore: true
    }
  }
];
