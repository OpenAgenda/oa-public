import toMixedMultipart from '@openagenda/utils/toMixedMultipart';

const LOAD = 'agenda-settings/agenda/LOAD';
const LOAD_SUCCESS = 'agenda-settings/agenda/LOAD_SUCCESS';
const LOAD_FAIL = 'agenda-settings/agenda/LOAD_FAIL';
const CREATE = 'agenda-settings/agenda/CREATE';
const CREATE_SUCCESS = 'agenda-settings/agenda/CREATE_SUCCESS';
const CREATE_FAIL = 'agenda-settings/agenda/CREATE_FAIL';
const EDIT = 'agenda-settings/agenda/EDIT';
const EDIT_SUCCESS = 'agenda-settings/agenda/EDIT_SUCCESS';
const EDIT_FAIL = 'agenda-settings/agenda/EDIT_FAIL';
const REMOVE = 'agenda-settings/agenda/REMOVE';
const REMOVE_SUCCESS = 'agenda-settings/agenda/REMOVE_SUCCESS';
const REMOVE_FAIL = 'agenda-settings/agenda/REMOVE_FAIL';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result.data,
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        data: null,
        error: typeof action.error.response.data.error === 'string'
          ? action.error.response.data.error
          : 'Error'
      };
    case EDIT_SUCCESS:
      return {
        ...state,
        data: action.result.data.agenda
      };
    default:
      return state;
  }
};

export function create(data) {
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.post(res.create, toMixedMultipart(data));
    }
  };
}

export function edit(data) {
  return {
    types: [EDIT, EDIT_SUCCESS, EDIT_FAIL],
    promise: ({ client, params }, { getState }) => {
      const { res } = getState();

      return client.post(res.set.replace(':slug', params.slug), toMixedMultipart(data));
    }
  };
}

export function remove() {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    promise: ({ client, params }, { getState }) => {
      const { res } = getState();

      return client.post(res.remove.replace(':slug', params.slug));
    }
  };
}
