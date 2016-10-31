const LOAD = 'home/agendas/LOAD';
const LOAD_SUCCESS = 'home/agendas/LOAD_SUCCESS';
const LOAD_FAIL = 'home/agendas/LOAD_FAIL';
const LIST = 'home/agendas/LIST';
const LIST_SUCCESS = 'home/agendas/LIST_SUCCESS';
const LIST_FAIL = 'home/agendas/LIST_FAIL';
const NEXT_PAGE = 'home/agendas/NEXT_PAGE';
const NEXT_PAGE_SUCCESS = 'home/agendas/NEXT_PAGE_SUCCESS';
const NEXT_PAGE_FAIL = 'home/agendas/NEXT_PAGE_FAIL';

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
    default:
      return state;
  }
}

export function isLoaded( globalState ) {
  return globalState.agendas && globalState.agendas.loaded;
}

export function load( query ) {
  return {
    types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
    promise: ( client, { res } ) => client.get( res.list, { query } )
  };
}

export function list( query ) {
  return {
    types: [ LIST, LIST_SUCCESS, LIST_FAIL ],
    promise: ( client, { res } ) => client.get( res.list, { query } )
  }
}

export function nextPage( query, page ) {
  return {
    types: [ NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL ],
    page,
    promise: ( client, { res, agendas } ) => client.get( res.list, { query: { ...query, page } } )
  }
}
