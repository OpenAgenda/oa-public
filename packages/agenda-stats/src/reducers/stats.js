import statsToAggregations from '../utils/statsToAggregations';

const LOAD = 'agenda-stats/stats/LOAD';
const LOAD_SUCCESS = 'agenda-stats/stats/LOAD_SUCCESS';
const LOAD_FAIL = 'agenda-stats/stats/LOAD_FAIL';
const LOAD_STAT = 'agenda-stats/stats/LOAD_STAT';
const LOAD_STAT_SUCCESS = 'agenda-stats/stats/LOAD_STAT_SUCCESS';
const LOAD_STAT_FAIL = 'agenda-stats/stats/LOAD_STAT_FAIL';

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
        totalEvents: action.result.data.total,
        data: action.stats.map(v => {
          if (!v.aggregation) {
            return v;
          }

          const getData = agg => action.result.data.aggregations[`${agg.type}-${v.id}`];

          if (Array.isArray(v.aggregation)) {
            // stat with multi sources
            return {
              ...v,
              data: v.aggregation.map(getData)
            };
          }

          return {
            ...v,
            data: getData(v.aggregation)
          };
        }),
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
    case LOAD_STAT_SUCCESS: {
      const statIndex = state.data.findIndex(v => v.id === action.statId);
      const actualStat = state.data[statIndex];

      const getData = agg => action.result.data.aggregations[`${agg.type}-${action.statId}`];

      const newStat = {
        ...actualStat,
        data: Array.isArray(action.aggregations)
          ? action.aggregations.map(getData)
          : getData(action.aggregations)
      };

      return {
        ...state,
        data: [
          ...state.data.slice(0, statIndex),
          newStat,
          ...state.data.slice(statIndex + 1)
        ]
      };
    }
    default:
      return state;
  }
}

export function load(agenda, stats, query, interval) {
  const params = {
    oaq: { passed: 1 },
    size: 0,
    aggregations: statsToAggregations(stats, { interval }),
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
    stats,
    query
  };
}

export function loadStat(agenda, statId, getOptions) {
  return ({ getState, dispatch }) => {
    const { stats, res } = getState();

    const actualStat = stats.data.find(v => v.id === statId);
    const aggregation = []
      .concat(actualStat.aggregation)
      .map(agg => getOptions(agg, actualStat.data));

    const params = {
      oaq: { passed: 1 },
      size: 0,
      aggregations: statsToAggregations([
        {
          ...actualStat,
          aggregation
        }
      ]),
      ...stats.query
    };

    return dispatch({
      types: [LOAD_STAT, LOAD_STAT_SUCCESS, LOAD_STAT_FAIL],
      promise: ({ client }) => {
        const url = res.jsonExport
          .replace(':slug', agenda.slug)
          .replace(':uid', agenda.uid);

        return client.get(url, { params });
      },
      statId,
      aggregations: Array.isArray(actualStat.aggregation)
        ? params.aggregations
        : params.aggregations[0]
    });
  };
}
