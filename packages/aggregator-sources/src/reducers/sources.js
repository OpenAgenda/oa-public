const LOAD = 'aggregator-sources/sources/LOAD';
const LOAD_SUCCESS = 'aggregator-sources/sources/LOAD_SUCCESS';
const LOAD_FAIL = 'aggregator-sources/sources/LOAD_FAIL';
const LIST = 'aggregator-sources/sources/LIST';
const LIST_SUCCESS = 'aggregator-sources/sources/LIST_SUCCESS';
const LIST_FAIL = 'aggregator-sources/sources/LIST_FAIL';
const ADD = 'aggregator-sources/sources/ADD';
const ADD_SUCCESS = 'aggregator-sources/sources/ADD_SUCCESS';
const ADD_FAIL = 'aggregator-sources/sources/ADD_FAIL';
const UPDATE = 'aggregator-sources/sources/UPDATE';
const UPDATE_SUCCESS = 'aggregator-sources/sources/UPDATE_SUCCESS';
const UPDATE_FAIL = 'aggregator-sources/sources/UPDATE_FAIL';
const REMOVE = 'aggregator-sources/sources/REMOVE';
const REMOVE_SUCCESS = 'aggregator-sources/sources/REMOVE_SUCCESS';
const REMOVE_FAIL = 'aggregator-sources/sources/REMOVE_FAIL';

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
        data: action.result.sources,
        error: null,
        loading: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        data: null,
        error: action.error,
        loading: false
      };
    case LIST:
      return {
        ...state,
        listLoading: true
      };
    case LIST_SUCCESS:
      return {
        ...state,
        data: action.result.sources,
        error: null,
        listLoading: false
      };
    case LIST_FAIL:
      return {
        ...state,
        data: null,
        error: action.error,
        listLoading: false
      };
    case REMOVE:
      return {
        ...state,
        removeLoading: true
      };
    case REMOVE_SUCCESS:
      return {
        ...state,
        removeError: null,
        removeLoading: false
      };
    case REMOVE_FAIL:
      return {
        ...state,
        removeError: action.error,
        removeLoading: false
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.sources && globalState.sources.loaded;
}

export function load(slug, query) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.list.replace(':slug', slug), { params: query });
    }
  };
}

export function list(query) {
  return {
    types: [LIST, LIST_SUCCESS, LIST_FAIL],
    promise: ({ client, params }, { getState }) => {
      const { res } = getState();

      return client.get(res.list.replace(':slug', params.slug), {
        params: query
      });
    }
  };
}

export function add(sourceAgenda, rules) {
  return {
    types: [ADD, ADD_SUCCESS, ADD_FAIL],
    promise: ({ client, params }, { getState }) => {
      const { res } = getState();

      return client.post(res.add.replace(':slug', params.slug), {
        agendaUid: sourceAgenda.uid,
        rules
      });
    }
  };
}

export function update(id, { rules }) {
  return {
    types: [UPDATE, UPDATE_SUCCESS, UPDATE_FAIL],
    promise: ({ client, params }, { getState }) => {
      const { res } = getState();

      const url = res.update
        .replace(':slug', params.slug)
        .replace(':sourceId', id);

      return client.put(url, { rules });
    }
  };
}

export function remove(id, { evaluate }) {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    id,
    promise: ({ client, params }, { getState }) => {
      const { res } = getState();

      const url = res.remove
        .replace(':slug', params.slug)
        .replace(':sourceId', id);

      return client.delete(url, {
        params: {
          evaluate
        }
      });
    }
  };
}
