import _ from 'lodash';
import getRoleSlug from '@openagenda/members/build/getRoleSlug';

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
const UPDATE = 'member-apps/members/UPDATE';
const UPDATE_SUCCESS = 'member-apps/members/UPDATE_SUCCESS';
const UPDATE_FAIL = 'member-apps/members/UPDATE_FAIL';
const INVITE = 'member-apps/members/INVITE';
const INVITE_SUCCESS = 'member-apps/members/INVITE_SUCCESS';
const INVITE_FAIL = 'member-apps/members/INVITE_FAIL';
const RESEND_INVITATION = 'member-apps/members/RESEND_INVITATION';
const RESEND_INVITATION_SUCCESS = 'member-apps/members/RESEND_INVITATION_SUCCESS';
const RESEND_INVITATION_FAIL = 'member-apps/members/RESEND_INVITATION_FAIL';
const REMOVE = 'member-apps/members/REMOVE';
const REMOVE_SUCCESS = 'member-apps/members/REMOVE_SUCCESS';
const REMOVE_FAIL = 'member-apps/members/REMOVE_FAIL';
const CLEAN_INVITE_RESULT = 'member-apps/members/CLEAN_INVITE_RESULT';
const ADD_CRED_FILTER = 'member-apps/members/ADD_CRED_FILTER';
const REMOVE_CRED_FILTER = 'member-apps/members/REMOVE_CRED_FILTER';
const CLEAN_CRED_FILTERS = 'member-apps/members/CLEAN_CRED_FILTERS';
const SEND_MESSAGE = 'member-apps/members/SEND_MESSAGE';
const SEND_MESSAGE_SUCCESS = 'member-apps/members/SEND_MESSAGE_SUCCESS';
const SEND_MESSAGE_FAIL = 'member-apps/members/SEND_MESSAGE_FAIL';


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
        data: action.result.members,
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
        stats: action.result
      };
    case LIST:
      return {
        ...state,
        loading: true
      };
    case LIST_SUCCESS:
      return {
        ...state,
        data: action.result.members,
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
        data: [ ...state.data, ...action.result.members ],
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
    case UPDATE:
      return {
        ...state,
        updateLoading: true
      };
    case UPDATE_SUCCESS:
      const data = state.data.map( sh => (sh.id === action.id ? {
        ...sh,
        role: action.result.role || sh.role,
        custom: { ...sh.custom, ...action.result.custom }
      } : sh) );
      return {
        ...state,
        data,
        updateError: null,
        updateLoading: false
      };
    case UPDATE_FAIL:
      return {
        ...state,
        updateError: action.error,
        updateLoading: false
      };
    case INVITE:
      return {
        ...state,
        inviteLoading: true
      };
    case INVITE_SUCCESS:
      return {
        ...state,
        inviteError: null,
        inviteLoading: false,
        showInviteResult: true
      };
    case INVITE_FAIL:
      return {
        ...state,
        inviteError: action.error,
        inviteLoading: false,
        showInviteResult: true
      };
    case REMOVE_SUCCESS:
      const index = state.data.findIndex( sh => sh.id === action.id );
      const member = state.data[ index ];
      const role = getRoleSlug( member.role );
      return {
        ...state,
        data: [ ...state.data.slice( 0, index ), ...state.data.slice( index + 1 ) ],
        total: state.total - 1,
        stats: {
          ...state.stats,
          total: state.stats.total - 1,
          totalPerRole: {
            ...state.stats.totalPerRole,
            [ role ]: state.stats.totalPerRole[ role ] - 1
          }
        }
      };
    case CLEAN_INVITE_RESULT:
      return {
        ...state,
        inviteError: false,
        showInviteResult: false
      };
    case ADD_CRED_FILTER:
      return {
        ...state,
        credFilters: [ ...state.credFilters, action.role ]
      };
    case REMOVE_CRED_FILTER:
      return {
        ...state,
        credFilters: state.credFilters.filter( role => role !== action.role )
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

export function load( query = {} ) {
  return {
    types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
    query,
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.list, { params: query } );
    }
  };
}

export function getStats() {
  return {
    types: [ GET_STATS, GET_STATS_SUCCESS, GET_STATS_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.stats );
    }
  };
}

export function list( query = {} ) {
  return {
    types: [ LIST, LIST_SUCCESS, LIST_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.list, { params: query } );
    }
  };
}

export function nextPage( query, page ) {
  return {
    types: [ NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL ],
    page,
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.get( res.list, {
        params: {
          ...query,
          page
        }
      } );
    }
  };
}

export function update( id, values ) {
  return {
    types: [ UPDATE, UPDATE_SUCCESS, UPDATE_FAIL ],
    id,
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.patch( res.update.replace( ':id', id ), {
        custom: _.omit( values, 'role' ),
        role: values.role
      } );

    }
  };
}

export function invite( data ) {
  return {
    types: [ INVITE, INVITE_SUCCESS, INVITE_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();
      const emails = _.get( data, 'emails', [] )
        .split( /[\s\n,]+/ )
        .map( email => email.trim() )
        .filter( email => !!email )

      return client.post( res.invite, {
        emails,
        role: data.role,
        context: {
          message: data.message
        }
      } );
    }
  };
}

export function resendInvitation( id ) {
  return {
    types: [ RESEND_INVITATION, RESEND_INVITATION_SUCCESS, RESEND_INVITATION_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.put( res.resend.replace( ':id', id ), {} );
    }
  };
}

export function cleanInviteResult() {
  return {
    type: CLEAN_INVITE_RESULT
  };
}

export function remove( id ) {
  return {
    types: [ REMOVE, REMOVE_SUCCESS, REMOVE_FAIL ],
    id,
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.delete( res.remove.replace( ':id', id ) );
    }
  };
}

export function sendMessage( data, query ) {
  return {
    types: [ SEND_MESSAGE, SEND_MESSAGE_SUCCESS, SEND_MESSAGE_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res } = getState();

      return client.post( res.sendMessage, data, { params: query } );
    }
  };
}

export function addCredFilter( role ) {
  return {
    type: ADD_CRED_FILTER,
    role
  };
}

export function removeCredFilter( role ) {
  return {
    type: REMOVE_CRED_FILTER,
    role
  };
}

export function cleanCredFilters() {
  return {
    type: CLEAN_CRED_FILTERS
  };
}
