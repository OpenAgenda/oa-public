import statsToAggregations from '../utils/statsToAggregations';
import mapAggregationsInStats from '../utils/mapAggregationsInStats';

const LOAD = 'agenda-stats/stats/LOAD';
const LOAD_SUCCESS = 'agenda-stats/stats/LOAD_SUCCESS';
const LOAD_FAIL = 'agenda-stats/stats/LOAD_FAIL';
const LOAD_STAT = 'agenda-stats/stats/LOAD_STAT';
const LOAD_STAT_SUCCESS = 'agenda-stats/stats/LOAD_STAT_SUCCESS';
const LOAD_STAT_FAIL = 'agenda-stats/stats/LOAD_STAT_FAIL';

const initialState = {};

const addKey = (aggregation, stat) => ({
  key: `${aggregation.type}-${stat.id}`,
  ...aggregation
});

const addInterval = interval => (aggregation, stat) => (stat.chart.intervalSelector && interval
  ? { ...aggregation, interval }
  : aggregation);

function decorateStats(stats, { interval } = {}) {
  let result = mapAggregationsInStats(stats, addKey);

  if (interval) {
    result = mapAggregationsInStats(result, addInterval(interval));
  }

  return result;
}

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
      const getData = agg => action.result.data.aggregations[`${agg.type}-${action.statId}`];

      const newStat = {
        ...action.stat,
        data: Array.isArray(action.stat.aggregation)
          ? action.stat.aggregation.map(getData)
          : getData(action.stat.aggregation)
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
  const decoratedStats = decorateStats(stats, { interval });
  const params = {
    oaq: { passed: 1 },
    size: 0,
    aggregations: statsToAggregations(decoratedStats),
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
    stats: decoratedStats,
    query
  };
}

export function loadStat(agenda, statId, getOptions) {
  return ({ getState, dispatch }) => {
    const { stats, res } = getState();

    const actualStat = stats.data.find(v => v.id === statId);
    const aggregation = Array.isArray(actualStat.aggregation)
      ? actualStat.aggregation.map(agg => getOptions(agg, actualStat.data))
      : getOptions(actualStat.aggregation, actualStat.data);

    const decoratedStats = decorateStats([
      {
        ...actualStat,
        aggregation
      }
    ]);
    const params = {
      oaq: { passed: 1 },
      size: 0,
      aggregations: statsToAggregations(decoratedStats),
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
      stat: decoratedStats[0]
    });
  };
}
