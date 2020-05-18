const LOAD = 'agenda-stats/stats/LOAD';
const LOAD_SUCCESS = 'agenda-stats/stats/LOAD_SUCCESS';
const LOAD_FAIL = 'agenda-stats/stats/LOAD_FAIL';
const LOAD_AGGREGATION = 'agenda-stats/stats/LOAD_AGGREGATION';
const LOAD_AGGREGATION_SUCCESS = 'agenda-stats/stats/LOAD_AGGREGATION_SUCCESS';
const LOAD_AGGREGATION_FAIL = 'agenda-stats/stats/LOAD_AGGREGATION_FAIL';

function getDefaultAggregations(interval) {
  return [
    'additionalFields',
    'cities',
    'departments',
    'keywords',
    'members',
    'timespan',
    'originAgendas',
    'pastAndUpcoming',
    'regions',
    // 'sourceAgendas',
    'states',
    {
      key: 'timings',
      type: 'timings',
      interval
    },
    {
      key: 'createdAt',
      type: 'createdAt',
      interval
    },
    {
      key: 'updatedAt',
      type: 'updatedAt',
      interval
    }
  ];
}

const initialState = {};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loaded: true,
        data: action.result.data.aggregations,
        totalEvents: action.result.data.total,
        aggregations: action.aggregations,
        query: action.query,
        error: null,
        loading: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    case LOAD_AGGREGATION_SUCCESS: {
      const aggIndex = state.aggregations.findIndex(
        v => v === action.aggregationKey || v.key === action.aggregationKey
      );

      return {
        ...state,
        data: {
          ...state.data,
          [action.aggregationKey]:
            action.result.data.aggregations[action.aggregationKey]
        },
        aggregations: [
          ...state.aggregations.slice(0, aggIndex),
          action.aggregation,
          ...state.aggregations.slice(aggIndex + 1)
        ]
      };
    }
    default:
      return state;
  }
}

export function load(agenda, query, interval) {
  const params = {
    oaq: { passed: 1 },
    size: 0,
    aggregations: getDefaultAggregations(interval),
    ...query
  };

  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();
      const url = res.jsonExport
        .replace(':slug', agenda.slug)
        .replace(':uid', agenda.uid);

      return client.get(url, { params });
    },
    aggregations: params.aggregations,
    query
  };
}

export function loadAggregation(agenda, aggregationKey, options) {
  return ({ getState, dispatch }) => {
    const { stats, res } = getState();

    const actualAggregation = stats.aggregations.find(
      v => v === aggregationKey || v.key === aggregationKey
    );
    const actualAggregationData = stats.data[aggregationKey];
    const aggOptions = typeof options === 'function'
      ? options(actualAggregation, actualAggregationData)
      : options;

    const params = {
      oaq: { passed: 1 },
      size: 0,
      aggregations: [
        {
          ...(typeof actualAggregation === 'string'
            ? { type: actualAggregation, key: actualAggregation }
            : actualAggregation),
          ...aggOptions
        }
      ],
      ...stats.query
    };

    return dispatch({
      types: [
        LOAD_AGGREGATION,
        LOAD_AGGREGATION_SUCCESS,
        LOAD_AGGREGATION_FAIL
      ],
      promise: ({ client }) => {
        const url = res.jsonExport
          .replace(':slug', agenda.slug)
          .replace(':uid', agenda.uid);

        return client.get(url, { params });
      },
      aggregationKey,
      aggregation: params.aggregations[0]
    });
  };
}
