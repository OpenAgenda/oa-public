const LOAD = 'agenda-stats/stats/LOAD';
const LOAD_SUCCESS = 'agenda-stats/stats/LOAD_SUCCESS';
const LOAD_FAIL = 'agenda-stats/stats/LOAD_FAIL';

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
        error: null,
        loading: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    default:
      return state;
  }
}

export function load(agenda, query) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();
      const url = res.jsonExport
        .replace(':slug', agenda.slug)
        .replace(':uid', agenda.uid);

      const params = {
        oaq: { passed: 1 },
        size: 0,
        aggregations: [
          'additionalFields',
          'cities',
          'eventsByDateRanges',
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
            interval: 'month',
            format: 'YYYY-MM'
          },
          {
            key: 'timingsByDay',
            type: 'timings',
            interval: 'day'
          }
        ],
        ...query
      };

      return client.get(url, { params });
    }
  };
}
