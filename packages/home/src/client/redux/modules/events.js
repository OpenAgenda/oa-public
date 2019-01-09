const LOAD = 'home/events/LOAD';
const LOAD_SUCCESS = 'home/events/LOAD_SUCCESS';
const LOAD_FAIL = 'home/events/LOAD_FAIL';
const LIST = 'home/events/LIST';
const LIST_SUCCESS = 'home/events/LIST_SUCCESS';
const LIST_FAIL = 'home/events/LIST_FAIL';
const NEXT_PAGE = 'home/events/NEXT_PAGE';
const NEXT_PAGE_SUCCESS = 'home/events/NEXT_PAGE_SUCCESS';
const NEXT_PAGE_FAIL = 'home/events/NEXT_PAGE_FAIL';

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
        data: action.result.events,
        total: action.result.total,
        page: 1,
        error: null,
        loading: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        data: null,
        total: null,
        page: 1,
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
        data: action.result.events,
        total: action.result.total,
        page: 1,
        error: null,
        listLoading: false
      };
    case LIST_FAIL:
      return {
        ...state,
        data: null,
        total: null,
        page: 1,
        error: action.error,
        listLoading: false
      };
    case NEXT_PAGE:
      return {
        ...state,
        nextLoading: true
      };
    case NEXT_PAGE_SUCCESS:
      return {
        ...state,
        data: [ ...state.data, ...action.result.events ],
        total: action.result.total,
        page: action.page,
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
  return globalState.events && globalState.events.loaded;
}

export function load( query ) {
  return {
    types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.events.list, { params: query } );
    }
  };
}

export function list( query ) {
  return {
    types: [ LIST, LIST_SUCCESS, LIST_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.events.list, { params: query } );
    }
  }
}

export function nextPage( query, page ) {
  return {
    types: [ NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL ],
    page,
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.events.list, { params: { ...query, page } } );
    }
  }
}
