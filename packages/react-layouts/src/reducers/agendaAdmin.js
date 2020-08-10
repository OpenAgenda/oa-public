const LOAD = 'react-layouts/agendaAdmin/LOAD';
const LOAD_SUCCESS = 'react-layouts/agendaAdmin/LOAD_SUCCESS';
const LOAD_FAIL = 'react-layouts/agendaAdmin/LOAD_FAIL';
const VERIFY_LOCATION_COUNT = 'react-layouts/agendaAdmin/VERIFY_LOCATION_COUNT';
const VERIFY_LOCATION_COUNT_SUCCESS = 'react-layouts/agendaAdmin/VERIFY_LOCATION_COUNT_SUCCESS';
const VERIFY_LOCATION_COUNT_FAIL = 'react-layouts/agendaAdmin/VERIFY_LOCATION_COUNT_FAIL';
const UPDATE_AGENDA = 'react-layouts/agendaAdmin/UPDATE_AGENDA';

const initialState = {};

export default (state = initialState, action) => {
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
        agenda: action.result.data.agenda,
        agendaSchema: action.result.data.schema,
        member: action.result.data.member,
        role: action.result.data.role,
        sections: action.result.data.sections,
        error: null,
        loading: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        agenda: null,
        agendaSchema: null,
        member: null,
        role: null,
        sections: null,
        error: action.error,
        loading: false
      };
    case VERIFY_LOCATION_COUNT:
      return {
        ...state,
        locationCount: null
      };
    case VERIFY_LOCATION_COUNT_SUCCESS:
      return {
        ...state,
        locationCount: action.result.data.count
      };
    case VERIFY_LOCATION_COUNT_FAIL:
      return {
        ...state,
        locationCount: null
      };
    case UPDATE_AGENDA:
      return {
        ...state,
        agenda: action.payload.agenda
      };
    default:
      return state;
  }
};

export function isLoaded(globalState) {
  return globalState.agendaAdmin && globalState.agendaAdmin.loaded;
}

export function load(slug, lang) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.agendaAdmin.loadAgenda.replace(':slug', slug), {
        params: {
          lang
        }
      });
    }
  };
}

export function verifyLocationCount(uid) {
  return {
    types: [
      VERIFY_LOCATION_COUNT,
      VERIFY_LOCATION_COUNT_SUCCESS,
      VERIFY_LOCATION_COUNT_FAIL
    ],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(
        res.agendaAdmin.verifyLocationCount.replace(':uid', uid)
      );
    }
  };
}
