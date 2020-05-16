const LOAD = 'agenda-stats/stats/LOAD';
const LOAD_SUCCESS = 'agenda-stats/stats/LOAD_SUCCESS';
const LOAD_FAIL = 'agenda-stats/stats/LOAD_FAIL';
const LOAD_MORE = 'agenda-stats/stats/LOAD_MORE';
const LOAD_MORE_SUCCESS = 'agenda-stats/stats/LOAD_MORE_SUCCESS';
const LOAD_MORE_FAIL = 'agenda-stats/stats/LOAD_MORE_FAIL';

const defaultAggregations = [
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
    key: 'timingsByMonth',
    type: 'timings',
    interval: 'month'
  },
  {
    key: 'timingsByWeek',
    type: 'timings',
    interval: 'week'
  },
  {
    key: 'timingsByDay',
    type: 'timings',
    interval: 'day'
  },
  {
    key: 'createdAtByMonth',
    type: 'createdAt',
    interval: 'month'
  },
  {
    key: 'createdAtByWeek',
    type: 'createdAt',
    interval: 'week'
  },
  {
    key: 'createdAtByDay',
    type: 'createdAt',
    interval: 'day'
  },
  {
    key: 'updatedAtByMonth',
    type: 'updatedAt',
    interval: 'month'
  },
  {
    key: 'updatedAtByWeek',
    type: 'updatedAt',
    interval: 'week'
  },
  {
    key: 'updatedAtByDay',
    type: 'updatedAt',
    interval: 'day'
  }
];

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
    case LOAD_MORE_SUCCESS:
      return {
        ...state,
        data: {
          ...state.data,
          [action.aggregation]:
            action.result.data.aggregations[action.aggregation]
        }
      };
    default:
      return state;
  }
}

export function load(agenda, query) {
  const params = {
    oaq: { passed: 1 },
    size: 0,
    aggregations: defaultAggregations,
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

export function loadMore(agenda, aggregation, moreSize = 5) {
  return ({ getState, dispatch }) => {
    const { stats, res } = getState();

    const actualAggregation = stats.aggregations.find(
      v => v === aggregation || v.type === aggregation
    );
    const actualAggregationData = stats.data[aggregation];

    const params = {
      oaq: { passed: 1 },
      size: 0,
      aggregations: [
        {
          ...(typeof actualAggregation === 'string'
            ? { type: actualAggregation, key: actualAggregation }
            : actualAggregation),
          size: (actualAggregationData.length || 0) + moreSize
        }
      ],
      ...stats.query
    };

    return dispatch({
      types: [LOAD_MORE, LOAD_MORE_SUCCESS, LOAD_MORE_FAIL],
      promise: ({ client }) => {
        const url = res.jsonExport
          .replace(':slug', agenda.slug)
          .replace(':uid', agenda.uid);

        return client.get(url, { params });
      },
      aggregation
    });
  };
}
