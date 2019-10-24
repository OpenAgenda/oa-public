const LOAD = 'react-layouts/agendaAdmin/LOAD';
const LOAD_SUCCESS = 'react-layouts/agendaAdmin/LOAD_SUCCESS';
const LOAD_FAIL = 'react-layouts/agendaAdmin/LOAD_FAIL';
const VERIFY_LOCATION_COUNT = 'react-layouts/agendaAdmin/VERIFY_LOCATION_COUNT';
const VERIFY_LOCATION_COUNT_SUCCESS = 'react-layouts/agendaAdmin/VERIFY_LOCATION_COUNT_SUCCESS';
const VERIFY_LOCATION_COUNT_FAIL = 'react-layouts/agendaAdmin/VERIFY_LOCATION_COUNT_FAIL';

const initialState = {};

export default (state = initialState, action) => {
  switch ( action.type ) {
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
        sections: action.result.sections,
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
    case VERIFY_LOCATION_COUNT:
      return {
        ...state,
        locationCount: null
      };
    case VERIFY_LOCATION_COUNT_SUCCESS:
      return {
        ...state,
        locationCount: action.result.count
      };
    case VERIFY_LOCATION_COUNT_FAIL:
      return {
        ...state,
        locationCount: null
      };
    default:
      return state;
  }
}

export function isLoaded( globalState ) {
  return globalState.agendaAdmin && globalState.agendaAdmin.loaded;
}

export function load(slug) {
  return {
    types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.agendaAdmin.loadAgenda.replace( ':slug', slug ) );
    }
  };
}

export function verifyLocationCount(slug) {
  return {
    types: [ VERIFY_LOCATION_COUNT, VERIFY_LOCATION_COUNT_SUCCESS, VERIFY_LOCATION_COUNT_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.agendaAdmin.verifyLocationCount.replace( ':slug', slug ) );
    }
  };
}
