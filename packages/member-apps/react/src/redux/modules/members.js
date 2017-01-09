const LOAD = 'member-apps/members/LOAD';
const LOAD_SUCCESS = 'member-apps/members/LOAD_SUCCESS';
const LOAD_FAIL = 'member-apps/members/LOAD_FAIL';
const GET_STATS = 'member-apps/members/GET_STATS';
const GET_STATS_SUCCESS = 'member-apps/members/GET_STATS_SUCCESS';
const GET_STATS_FAIL = 'member-apps/members/GET_STATS_FAIL';
const LIST = 'member-apps/members/LIST';
const LIST_SUCCESS = 'member-apps/members/LIST_SUCCESS';
const LIST_FAIL = 'member-apps/members/LIST_FAIL';
const NEXT_PAGE = 'member-apps/members/NEXT_PAGE';
const NEXT_PAGE_SUCCESS = 'member-apps/members/NEXT_PAGE_SUCCESS';
const NEXT_PAGE_FAIL = 'member-apps/members/NEXT_PAGE_FAIL';
const ADD_CRED_FILTER = 'member-apps/members/ADD_CRED_FILTER';
const REMOVE_CRED_FILTER = 'member-apps/members/REMOVE_CRED_FILTER';
const CLEAN_CRED_FILTERS = 'member-apps/members/CLEAN_CRED_FILTERS';


const initialState = {
  loaded: false,
  credFilters: []
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
        data: action.result.stakeholders,
        total: action.result.total,
        credFilters: [].concat( action.query.credentials || [] ),
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
    case GET_STATS_SUCCESS:
      return {
        ...state,
        stats: action.result.stats
      };
    case LIST:
      return {
        ...state,
        loading: true
      };
    case LIST_SUCCESS:
      return {
        ...state,
        data: action.result.stakeholders,
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
        data: [ ...state.data, ...action.result.stakeholders ],
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
    case ADD_CRED_FILTER:
      return {
        ...state,
        credFilters: [ ...state.credFilters, action.credential ]
      };
    case REMOVE_CRED_FILTER:
      return {
        ...state,
        credFilters: state.credFilters.filter( credential => credential !== action.credential )
      };
    case CLEAN_CRED_FILTERS:
      return {
        ...state,
        credFilters: []
      };
    default:
      return state;

  }

}

export function isLoaded( globalState ) {
  return globalState.members && globalState.members.loaded;
}

export function load( query ) {
  return {
    types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
    query,
    promise: ( client, { res } ) => client.get( res.list, { query } )
  };
}

export function getStats() {
  return {
    types: [ GET_STATS, GET_STATS_SUCCESS, GET_STATS_FAIL ],
    promise: ( client, { res } ) => client.get( res.stats )
  };
}

export function list( query ) {
  return {
    types: [ LIST, LIST_SUCCESS, LIST_FAIL ],
    promise: ( client, { res } ) => client.get( res.list, { query } )
  };
}

export function nextPage( query, page ) {
  return {
    types: [ NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL ],
    page,
    promise: ( client, { res } ) => client.get( res.list, {
      query: {
        ...query,
        page
      }
    } )
  };
}

/* export function remove( id ) {
  return {
    types: [ REMOVE, REMOVE_SUCCESS, REMOVE_FAIL ],
    promise: ( client, { res } ) => client.get( res.remove )
  }
} */

export function addCredFilter( credential ) {
  return {
    type: ADD_CRED_FILTER,
    credential
  };
}

export function removeCredFilter( credential ) {
  return {
    type: REMOVE_CRED_FILTER,
    credential
  };
}

export function cleanCredFilters() {
  return {
    type: CLEAN_CRED_FILTERS
  };
}
