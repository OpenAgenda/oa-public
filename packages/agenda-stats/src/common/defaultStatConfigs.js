import { defaultStateColors, defaultBooleanColors } from './defaultDataColors';

const defaultStatConfigs = {
  // Charts
  regions: {
    aggregation: {
      type: 'regions',
      missing: 'null',
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'key',
      loadMore: true,
    },
  },
  departments: {
    aggregation: {
      type: 'departments',
      missing: 'null',
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'key',
      loadMore: true,
    },
  },
  cities: {
    aggregation: {
      type: 'cities',
      missing: 'null',
    },
    chart: {
      type: 'vertical',
      dataKey: 'eventCount',
      labelKey: 'key',
      loadMore: true,
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
      loadMore: true,
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
      loadMore: true,
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
    const isBoolean = fieldSchema.fieldType === 'boolean';

    // eslint-disable-next-line no-nested-ternary
    const dataColors = isBoolean
      ? defaultBooleanColors
      : isCheckbox
        ? ['#41acdd', '#c6c6c6']
        : undefined;

    return {
      aggregation: {
        type: 'additionalFields',
        field: fieldSchema.field,
        missing: 'null',
      },
      chart: {
        type: isCheckbox || isBoolean ? 'pie' : 'vertical',
        dataKey: 'eventCount',
        labelKey: isBoolean ? 'key' : 'label',
        restItem: isCheckbox,
        dataColors,
        loadMore: !(isCheckbox || isBoolean),
        tooltip: isBoolean ? 'boolean' : undefined,
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
