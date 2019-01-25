const LOAD = 'activity-apps/activities/LOAD';
const LOAD_SUCCESS = 'activity-apps/activities/LOAD_SUCCESS';
const LOAD_FAIL = 'activity-apps/activities/LOAD_FAIL';
const LIST = 'activity-apps/activities/LIST';
const LIST_SUCCESS = 'activity-apps/activities/LIST_SUCCESS';
const LIST_FAIL = 'activity-apps/activities/LIST_FAIL';
const NEXT_PAGE = 'activity-apps/activities/NEXT_PAGE';
const NEXT_PAGE_SUCCESS = 'activity-apps/activities/NEXT_PAGE_SUCCESS';
const NEXT_PAGE_FAIL = 'activity-apps/activities/NEXT_PAGE_FAIL';

const initialState = {
  loaded: false
};

export default function reducer( state = initialState, action ) {
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
        data: action.result.activities,
        lastPage: action.result.activities.length < action.perPageLimit,
        fromId: 0,
        error: null,
        loading: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        data: null,
        fromId: 0,
        error: action.error,
        loading: false
      };
    case LIST:
      return {
        ...state,
        loading: true,
      };
    case LIST_SUCCESS:
      return {
        ...state,
        data: action.result.activities,
        lastPage: action.result.activities.length < action.perPageLimit,
        fromId: 0,
        error: null,
        loading: false
      };
    case LIST_FAIL:
      return {
        ...state,
        data: null,
        fromId: 0,
        error: action.error,
        loading: false
      };
    case NEXT_PAGE:
      return {
        ...state,
        nextLoading: true
      };
    case NEXT_PAGE_SUCCESS:
      return {
        ...state,
        data: [ ...state.data, ...action.result.activities ],
        lastPage: action.result.activities.length < action.perPageLimit,
        fromId: action.fromId,
        error: null,
        nextLoading: false
      };
    case NEXT_PAGE_FAIL:
      return {
        ...state,
        error: action.error,
        nextLoading: false
      };
    default:
      return state;
  }
}

export function isLoaded( globalState ) {
  return globalState.activities && globalState.activities.loaded;
}

export function load( query ) {
  return ( { dispatch, getState } ) => {
    const { settings, res } = getState();

    return dispatch( {
      types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
      perPageLimit: settings.perPageLimit,
      promise: ( { client } ) => client.get( res.list, { params: query } )
    } );
  };
}

export function list( query ) {
  return ( { dispatch, getState } ) => {
    const { settings, res } = getState();

    return dispatch( {
      types: [ LIST, LIST_SUCCESS, LIST_FAIL ],
      perPageLimit: settings.perPageLimit,
      promise: ( { client } ) => client.get( res.list, { params: query } )
    } );
  };
}

export function nextPage( query, fromId ) {
  return ( { dispatch, getState } ) => {
    const { settings, res } = getState();

    return dispatch( {
      types: [ NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL ],
      fromId,
      perPageLimit: settings.perPageLimit,
      promise: ( { client } ) => client.get( res.list, {
        params: {
          ...query,
          fromId
        }
      } )
    } );
  };
}
