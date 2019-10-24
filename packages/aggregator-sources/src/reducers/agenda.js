const LOAD = 'aggregator-sources/agenda/LOAD';
const LOAD_SUCCESS = 'aggregator-sources/agenda/LOAD_SUCCESS';
const LOAD_FAIL = 'aggregator-sources/agenda/LOAD_FAIL';
const CREATE_AGG = 'aggregator-sources/agenda/CREATE_AGG';
const CREATE_AGG_SUCCESS = 'aggregator-sources/agenda/CREATE_AGG_SUCCESS';
const CREATE_AGG_FAIL = 'aggregator-sources/agenda/CREATE_AGG_FAIL';

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
        data: action.result.agenda,
        role: action.result.role,
        sections: action.result.sections, // for AgendaAdminLayout
        error: null,
        loading: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        data: null,
        role: null,
        sections: null,
        error: action.error,
        loading: false
      };
    case CREATE_AGG_SUCCESS:
      return {
        ...state,
        isAggregator: true
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.agenda && globalState.agenda.loaded;
}

export function load(slug) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.loadAgenda.replace(':slug', slug));
    }
  };
}

export function createAggregator(uid) {
  return {
    types: [CREATE_AGG, CREATE_AGG_SUCCESS, CREATE_AGG_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.createAggregator.replace(':uid', uid));
    }
  };
}
