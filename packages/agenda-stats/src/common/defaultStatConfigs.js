import { defaultStateColors } from './defaultDataColors';

const defaultStatConfigs = {
  // Charts
  regions: {
    aggregation: {
      type: 'regions',
      missing: 'null',
    },
    chart: {
      type: 'vertical',
      loadMore: true,
      dataKey: 'eventCount',
      labelKey: 'key',
    },
  },
  departments: {
    aggregation: {
      type: 'departments',
      missing: 'null',
    },
    chart: {
      type: 'vertical',
      loadMore: true,
      dataKey: 'eventCount',
      labelKey: 'key',
    },
  },
  cities: {
    aggregation: {
      type: 'cities',
      missing: 'null',
    },
    chart: {
      type: 'vertical',
      loadMore: true,
      dataKey: 'eventCount',
      labelKey: 'key',
    },
  },
  timings: {
    aggregation: {
      type: 'timings',
    },
    chart: {
      type: 'horizontal',
      intervalSelector: true,
      dataKey: 'timingCount',
      labelKey: 'key',
      tooltip: 'date',
      categoryTick: 'date',
    },
  },
  createdAt: {
    aggregation: {
      type: 'createdAt',
    },
    chart: {
      type: 'horizontal',
      intervalSelector: true,
      dataKey: 'eventCount',
      labelKey: 'key',
      tooltip: 'date',
      categoryTick: 'date',
    },
  },
  updatedAt: {
    aggregation: {
      type: 'updatedAt',
    },
    chart: {
      type: 'horizontal',
      intervalSelector: true,
      dataKey: 'eventCount',
      labelKey: 'key',
      tooltip: 'date',
      categoryTick: 'date',
    },
  },
  members: {
    aggregation: {
      type: 'members',
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'member.name',
    },
  },
  originAgendas: {
    aggregation: {
      type: 'originAgendas',
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'agenda.title',
    },
  },
  keywords: {
    aggregation: {
      type: 'keywords',
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'key',
      loadMore: true,
    },
  },
  states: {
    aggregation: {
      type: 'states',
    },
    chart: {
      type: 'pie',
      dataKey: 'eventCount',
      labelKey: 'key',
      tooltip: 'state',
      dataColors: defaultStateColors,
    },
  },
  additionalFieldMetrics: ({ fieldSchema }) => ({
    aggregation: {
      type: 'additionalFieldMetrics',
      dataKey: ['avg'],
    },
    chart: {
      type: 'metrics',
    },
    state: {
      fieldSchema,
    },
  }),
  additionalFields: ({ fieldSchema }) => {
    const isCheckbox = fieldSchema.fieldType === 'checkbox' && fieldSchema.options.length === 1;

    return {
      aggregation: {
        type: 'additionalFields',
        field: fieldSchema.field,
        missing: !isCheckbox ? 'null' : undefined,
      },
      chart: {
        type: isCheckbox ? 'pie' : 'vertical',
        dataKey: 'eventCount',
        labelKey: 'label',
        restItem: isCheckbox,
        dataColors: isCheckbox ? ['#41acdd', '#c6c6c6'] : null,
        loadMore: !isCheckbox,
      },
      state: {
        fieldSchema,
      },
    };
  },
  // Others
  separator: { separator: true },
};

export default function getDefaultStatConfig(aggType, fieldSchema) {
  const opt = aggType === 'additionalFields' ? { fieldSchema } : {};
  const result = typeof defaultStatConfigs[aggType] === 'function'
    ? defaultStatConfigs[aggType](opt)
    : defaultStatConfigs[aggType];

  return {
    ...result,
  };
}

export function getStatConfig(stat) {
  const defaultConfig = getDefaultStatConfig(
    stat.aggregation.type,
    stat.state.fieldSchema
  );

  return {
    aggregation: {
      ...defaultConfig?.aggregation,
      ...stat.aggregation,
    },
    chart: {
      ...defaultConfig?.chart,
      ...stat.chart,
    },
    ...stat,
  };
}

export function getChartConfig(stat) {
  const defaultConfig = getDefaultStatConfig(
    stat.aggregation.type,
    stat.state.fieldSchema
  );

  return {
    ...defaultConfig?.chart,
    ...stat.chart,
  };
}
