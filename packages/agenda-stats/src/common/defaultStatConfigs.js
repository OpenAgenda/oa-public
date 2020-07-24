import { defaultStateColors } from './defaultDataColors';

const defaultStatConfigs = {
  // Charts
  regions: {
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
  departments: {
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
  cities: {
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
  timings: {
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
  createdAt: {
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
  updatedAt: {
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
  members: {
    aggregation: {
      type: 'members'
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'member.name'
    }
  },
  originAgendas: {
    aggregation: {
      type: 'originAgendas'
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'agenda.title'
    }
  },
  keywords: {
    aggregation: {
      type: 'keywords'
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'key',
      loadMore: true
    }
  },
  states: {
    aggregation: {
      type: 'states'
    },
    chart: {
      type: 'pie',
      dataKey: 'eventCount',
      labelKey: 'key',
      tooltip: 'state',
      dataColors: defaultStateColors
    }
  },
  additionalFields: ({ fieldSchema }) => {
    const isCheckbox = fieldSchema.fieldType === 'checkbox' && fieldSchema.options.length === 1;

    return {
      aggregation: {
        type: 'states',
        field: fieldSchema.field
      },
      chart: {
        type: isCheckbox ? 'pie' : 'vertical',
        dataKey: 'eventCount',
        labelKey: 'label',
        restItem: isCheckbox,
        dataColors: isCheckbox ? ['#41acdd', '#c6c6c6'] : null
      },
      state: {
        fieldSchema
      }
    };
  },
  // Others
  separator: { separator: true }
};

export default defaultStatConfigs;
