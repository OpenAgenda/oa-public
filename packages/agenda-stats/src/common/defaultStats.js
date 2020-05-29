const DEFAULT_STATS = [
  {
    aggregation: {
      type: 'regions'
    },
    chart: {
      orientation: 'vertical',
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
      orientation: 'vertical',
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
      orientation: 'vertical',
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
      orientation: 'horizontal',
      intervalSelector: true,
      dataKey: 'timingCount',
      labelKey: 'key',
      tooltip: 'date',
      xAxisTick: 'date'
    }
  },
  {
    aggregation: [{ type: 'createdAt' }, { type: 'updatedAt' }],
    chart: {
      orientation: 'horizontal',
      intervalSelector: true,
      fromDataKey: ['eventCount', 'eventCount'],
      dataKey: ['createdCount', 'updatedCount'],
      labelKey: 'key',
      tooltip: 'date',
      xAxisTick: 'date'
    }
  },
  { separator: true },
  {
    aggregation: {
      type: 'members'
    },
    chart: {
      orientation: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'member.name'
    }
  },
  {
    aggregation: {
      type: 'originAgendas'
    },
    chart: {
      orientation: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'agenda.title'
    }
  }
  // { separator: true }
  // {
  //   aggregation: {
  //     type: 'additionalFields'
  //   },
  //   chart: {}
  // },
  // {
  //   aggregation: {
  //     type: 'keywords'
  //   },
  //   chart: {}
  // },
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

export default DEFAULT_STATS;
