'use strict';

module.exports = [
  {
    aggregation: {
      type: 'regions'
    },
    chart: {
      type: 'vertical',
      loadMore: true,
      dataKey: 'eventCount',
      labelKey: 'key'
    }
  },
  {
    aggregation: {
      type: 'departments'
    },
    chart: {
      type: 'vertical',
      loadMore: true,
      dataKey: 'eventCount',
      labelKey: 'key'
    }
  },
  {
    aggregation: {
      type: 'cities'
    },
    chart: {
      type: 'vertical',
      loadMore: true,
      dataKey: 'eventCount',
      labelKey: 'key'
    }
  },
  { separator: true },
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
  // {
  //   aggregation: [{ type: 'createdAt' }, { type: 'updatedAt' }],
  //   chart: {
  //     type: 'horizontal',
  //     intervalSelector: true,
  //     fromDataKey: ['eventCount', 'eventCount'],
  //     dataKey: ['createdCount', 'updatedCount'],
  //     labelKey: 'key',
  //     tooltip: 'date',
  //     categoryTick: 'date'
  //   }
  // },
  {
    aggregation: { type: 'createdAt' },
    chart: {
      type: 'horizontal',
      intervalSelector: true,
      dataKey: 'eventCount',
      labelKey: 'key',
      tooltip: 'date',
      categoryTick: 'date'
    }
  },
  {
    aggregation: { type: 'updatedAt' },
    chart: {
      type: 'horizontal',
      intervalSelector: true,
      dataKey: 'eventCount',
      labelKey: 'key',
      tooltip: 'date',
      categoryTick: 'date'
    }
  },
  { separator: true },
  {
    aggregation: {
      type: 'members'
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'member.name'
    }
  },
  {
    aggregation: {
      type: 'originAgendas'
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'agenda.title'
    }
  },
  { separator: true },
  {
    aggregation: {
      type: 'keywords'
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'key'
    }
  },
  {
    aggregation: {
      type: 'states'
    },
    chart: {
      type: 'pie',
      dataKey: 'eventCount',
      labelKey: 'key',
      tooltip: 'state'
    }
  },
  // {
  //   aggregation: {
  //     type: 'pastAndUpcoming'
  //   },
  //   chart: {}
  // },
  // {
  //   aggregation: {
  //     type: 'states',
  //     interval
  //   },
  //   chart: {}
  // },
  // {
  //   aggregation: {
  //     type: 'sourceAgendas',
  //     interval
  //   },
  //   chart: {}
  // },
];
