const LOAD = 'aggregator-sources/sources/LOAD';
const LOAD_SUCCESS = 'aggregator-sources/sources/LOAD_SUCCESS';
const LOAD_FAIL = 'aggregator-sources/sources/LOAD_FAIL';
const LIST = 'aggregator-sources/sources/LIST';
const LIST_SUCCESS = 'aggregator-sources/sources/LIST_SUCCESS';
const LIST_FAIL = 'aggregator-sources/sources/LIST_FAIL';
const NEXT_PAGE = 'aggregator-sources/sources/NEXT_PAGE';
const NEXT_PAGE_SUCCESS = 'aggregator-sources/sources/NEXT_PAGE_SUCCESS';
const NEXT_PAGE_FAIL = 'aggregator-sources/sources/NEXT_PAGE_FAIL';
const REMOVE = 'aggregator-sources/sources/REMOVE';
const REMOVE_SUCCESS = 'aggregator-sources/sources/REMOVE_SUCCESS';
const REMOVE_FAIL = 'aggregator-sources/sources/REMOVE_FAIL';

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
        data: action.result.reviews,
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
        loading: true
      };
    case LIST_SUCCESS:
      return {
        ...state,
        data: action.result.reviews,
        total: action.result.total,
        page: 1,
        error: null,
        loading: false
      };
    case LIST_FAIL:
      return {
        ...state,
        data: null,
        total: null,
        page: 1,
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
        data: [ ...state.data, ...action.result.reviews ],
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
    case REMOVE:
      return {
        ...state,
        removeLoading: true
      };
    case REMOVE_SUCCESS:
      return {
        ...state,
        data: state.data.filter( v => v.uid !== action.uid ),
        total: state.total - 1,
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

export function isLoaded( globalState ) {
  return globalState.sources && globalState.sources.loaded;
}

export function load( query ) {
  return {
    types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
    promise: ( client, { res, agenda } ) => client.get( res.list.replace( ':slug', agenda.slug ), { query } )
  };
}

export function list( query ) {
  return {
    types: [ LIST, LIST_SUCCESS, LIST_FAIL ],
    promise: ( client, { res, agenda } ) => client.get( res.list.replace( ':slug', agenda.slug ), { query } )
  }
}

export function nextPage( query, page ) {
  return {
    types: [ NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL ],
    page,
    promise: ( client, { res, agenda } ) => client.get( res.list.replace( ':slug', agenda.slug ), {
      query: {
        ...query,
        page
      }
    } )
  }
}

export function remove( uid ) {
  return {
    types: [ REMOVE, REMOVE_SUCCESS, REMOVE_FAIL ],
    uid,
    promise: ( client, { res, agenda } ) => client.get( res.remove.replace( ':slug', agenda.slug ), {
      query: {
        uid
      }
    } )
  }
}
