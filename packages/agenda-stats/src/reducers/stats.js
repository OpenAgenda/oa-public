import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import statsToAggregations from '../utils/statsToAggregations';
import rangeToCalendarInterval from '../utils/rangeToCalendarInterval';
import { getChartConfig } from '../common/defaultStatConfigs';

const LOAD = 'agenda-stats/stats/LOAD';
const LOAD_SUCCESS = 'agenda-stats/stats/LOAD_SUCCESS';
const LOAD_FAIL = 'agenda-stats/stats/LOAD_FAIL';
const LOAD_STAT = 'agenda-stats/stats/LOAD_STAT';
const LOAD_STAT_SUCCESS = 'agenda-stats/stats/LOAD_STAT_SUCCESS';
const LOAD_STAT_FAIL = 'agenda-stats/stats/LOAD_STAT_FAIL';
const SET_EDIT_MODE = 'agenda-stats/stats/SET_EDIT_MODE';
const CANCEL_EDIT = 'agenda-stats/stats/CANCEL_EDIT';
const REORDER_STATS = 'agenda-stats/stats/REORDER_STATS';
const REMOVE_STAT = 'agenda-stats/stats/REMOVE_STAT';
const ADD_STAT = 'agenda-stats/stats/ADD_STAT';
const UPDATE_STAT = 'agenda-stats/stats/UPDATE_STAT';
const SAVE = 'agenda-stats/stats/SAVE';
const SAVE_SUCCESS = 'agenda-stats/stats/SAVE_SUCCESS';
const SAVE_FAIL = 'agenda-stats/stats/SAVE_FAIL';

const AGGREGATION_SIZE = 2000;

const initialState = {};

function addId(stat) {
  return {
    ...stat,
    id: typeof stat.id !== 'undefined' ? stat.id : uuidv4(),
  };
}

function addState(stat) {
  return {
    ...stat,
    state: typeof stat.state !== 'undefined' ? stat.state : {},
  };
}

function addInterval(query) {
  return stat => {
    if (!stat.chart) {
      return stat;
    }

    const chart = getChartConfig(stat);

    if (!chart.intervalSelector) {
      return stat;
    }

    const range = query[stat.aggregation.type];
    const interval = range
      ? rangeToCalendarInterval(range, chart.width)
      : stat.state.interval || 'month';

    return {
      ...stat,
      state: {
        ...stat.state,
        interval,
      },
    };
  };
}

function addSize(size) {
  return stat => ({
    ...stat,
    state: {
      ...stat.state,
      size,
    },
  });
}

function decorateStats(stats, query = {}) {
  return stats
    .map(addId)
    .map(addState)
    .map(addInterval(query))
    .map(addSize(AGGREGATION_SIZE));
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true,
        data: action.stats.map(v => {
          if (!v.aggregation) {
            return v;
          }

          return {
            ...v,
            state: {
              ...v.state,
              loading: true,
            },
          };
        }),
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        agendaUid: action.agendaUid,
        loaded: true,
        totalEvents: action.result.data.total,
        data: action.stats.map(v => {
          if (!v.aggregation) {
            return v;
          }

          const getData = agg => action.result.data.aggregations[`${agg.type}-${v.id}`];

          return {
            ...v,
            state: {
              ...v.state,
              loading: false,
              loaded: true,
              itemsDisplayed: 10,
              data: Array.isArray(v.aggregation)
                ? v.aggregation.map(getData)
                : getData(v.aggregation),
            },
          };
        }),
        query: action.query,
        error: null,
        loading: false,
      };
    case LOAD_FAIL:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case LOAD_STAT: {
      const statIndex = state.data.findIndex(v => v.id === action.statId);
      const newStat = {
        ...action.stat,
        state: {
          ...action.stat.state,
          loading: true,
        },
      };

      return {
        ...state,
        data: [
          ...state.data.slice(0, statIndex),
          newStat,
          ...state.data.slice(statIndex + 1),
        ],
      };
    }
    case LOAD_STAT_FAIL: {
      const statIndex = state.data.findIndex(v => v.id === action.statId);
      const newStat = {
        ...action.stat,
        state: {
          ...action.stat.state,
          loading: false,
        },
      };

      return {
        ...state,
        data: [
          ...state.data.slice(0, statIndex),
          newStat,
          ...state.data.slice(statIndex + 1),
        ],
      };
    }
    case LOAD_STAT_SUCCESS: {
      const statIndex = state.data.findIndex(v => v.id === action.statId);
      const getData = agg => action.result.data.aggregations[`${agg.type}-${action.statId}`];

      const newStat = {
        ...action.stat,
        state: {
          ...action.stat.state,
          interval: action.stat.state.interval,
          loading: false,
          itemsDisplayed: 10,
          data: Array.isArray(action.stat.aggregation)
            ? action.stat.aggregation.map(getData)
            : getData(action.stat.aggregation),
        },
      };

      return {
        ...state,
        data: [
          ...state.data.slice(0, statIndex),
          newStat,
          ...state.data.slice(statIndex + 1),
        ],
      };
    }
    case SET_EDIT_MODE: {
      return {
        ...state,
        editing: !!action.editing,
        data: !action.editing ? _.clone(state.dataBeforeEdit) : state.data,
        dataBeforeEdit: action.editing
          ? _.clone(state.data)
          : state.dataBeforeEdit,
      };
    }
    case CANCEL_EDIT: {
      return {
        ...state,
        editing: false,
        data: _.clone(state.dataBeforeEdit),
        dataBeforeEdit: null,
      };
    }
    case REMOVE_STAT: {
      return {
        ...state,
        data: state.data.filter(stat => stat.id !== action.statId),
      };
    }
    case ADD_STAT: {
      return {
        ...state,
        data: [...state.data, action.stat],
      };
    }
    case UPDATE_STAT: {
      const statIndex = state.data.findIndex(v => v.id === action.statId);
      const actualStat = state.data[statIndex];
      const newStat = {
        ...actualStat,
        aggregation: {
          ...actualStat.aggregation,
          ...action.values.aggregation,
        },
        chart: {
          ...actualStat.chart,
          ...action.values.chart,
        },
        state: {
          ...actualStat.state,
          ...action.values.state,
        },
      };

      return {
        ...state,
        data: [
          ...state.data.slice(0, statIndex),
          newStat,
          ...state.data.slice(statIndex + 1),
        ],
      };
    }
    case SAVE_SUCCESS: {
      return {
        ...state,
        editing: false,
        dataBeforeEdit: null,
      };
    }
    case REORDER_STATS: {
      return {
        ...state,
        data: action.statIds.map(id => state.data.find(v => v.id === id)),
      };
    }
    default:
      return state;
  }
}

export function load(agenda, stats, filters, query) {
  return ({ getState, dispatch }) => {
    const state = getState();

    const filterAggregations = filters
      .filter(
        filter => filter.aggregation !== null
          && !stats.find(stat => _.isMatch(
            stat.aggregation,
            _.omit(
              {
                type: filter.name,
                ...filter.aggregation,
              },
              'size'
            )
          ))
      )
      .map(filter => ({
        // like stats
        id: filter.id,
        aggregation: {
          type: filter.name,
          ...filter.aggregation,
        },
      }));

    const allStats = stats.concat(filterAggregations);

    const decoratedStats = decorateStats(allStats, query);
    const aggregations = statsToAggregations(decoratedStats);

    const params = {
      oaq: { passed: 1 },
      size: 0,
      aggs: aggregations,
      ...query,
    };

    return dispatch({
      types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
      promise: ({ client }) => {
        const url = state.res.jsonExport
          .replace(':slug', agenda.slug)
          .replace(':uid', agenda.uid);

        return client.get(url, { params });
      },
      stats: decoratedStats,
      agendaUid: agenda.uid,
      query,
    });
  };
}

export function loadStat(agenda, statId, getStat = _.identity) {
  return ({ getState, dispatch }) => {
    const { stats, res } = getState();

    const actualStat = stats.data.find(v => v.id === statId);
    const newStat = getStat(actualStat);

    const decoratedStats = decorateStats([newStat]);
    const params = {
      oaq: { passed: 1 },
      size: 0,
      aggregations: statsToAggregations(decoratedStats),
      ...stats.query,
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
      stat: decoratedStats[0],
    });
  };
}

export function setEditMode(editing) {
  return {
    type: SET_EDIT_MODE,
    editing,
  };
}

export function save(agenda) {
  return ({ getState, dispatch }) => {
    const { stats, res } = getState();
    const { data } = stats;

    return dispatch({
      types: [SAVE, SAVE_SUCCESS, SAVE_FAIL],
      promise: ({ client }) => {
        const url = res.statsConfig
          .replace(':slug', agenda.slug)
          .replace(':uid', agenda.uid);

        return client.put(
          url,
          data
            .filter(v => v.chart || v.separator)
            .map(v => ({
              id: v.id,
              aggregation: v.aggregation,
              chart: v.chart,
              separator: v.separator,
            }))
        );
      },
    });
  };
}

export function removeStat(statId) {
  return {
    type: REMOVE_STAT,
    statId,
  };
}

export function addStat(stat) {
  return ({ getState, dispatch }) => {
    const { query } = getState().stats;

    return dispatch({
      type: ADD_STAT,
      stat: decorateStats([stat], query)[0],
    });
  };
}

export function updateStat(statId, values) {
  return {
    type: UPDATE_STAT,
    statId,
    values,
  };
}

export function reorderStats(statIds) {
  return {
    type: REORDER_STATS,
    statIds,
  };
}
