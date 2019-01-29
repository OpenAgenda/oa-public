import _ from 'lodash';

const LOAD = 'inbox-apps/inbox/LOAD';
const LOAD_SUCCESS = 'inbox-apps/inbox/LOAD_SUCCESS';
const LOAD_FAIL = 'inbox-apps/inbox/LOAD_FAIL';
const NEXT_PAGE = 'inbox-apps/inbox/NEXT_PAGE';
const NEXT_PAGE_SUCCESS = 'inbox-apps/inbox/NEXT_PAGE_SUCCESS';
const NEXT_PAGE_FAIL = 'inbox-apps/inbox/NEXT_PAGE_FAIL';

const initialState = {
  loaded: false,
  query: {}
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
        query: action.result.query,
        data: action.result.conversations,
        total: action.result.total,
        totalOpened: action.result.totalOpened,
        totalClosed: action.result.totalClosed,
        lastPage: action.result.conversations.length < action.perPageLimit,
        page: 1,
        error: null,
        loading: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        data: null,
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
        data: [ ...state.data, ...action.result.conversations ],
        lastPage: action.result.conversations.length < action.perPageLimit,
        page: state.page + (action.result.conversations.length ? 1 : 0),
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
  return globalState.inbox && globalState.inbox.loaded;
}

export function load( query ) {
  return ( { getState, dispatch } ) => {
    const state = getState();
    const { res, agenda, event, settings: { perPageLimit, defaultQuery } } = state;

    return dispatch( {
      types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
      query,
      perPageLimit,
      promise: ( { client } ) => client.get(
        res.conversations.list
          .replace( ':slug', agenda && agenda.slug )
          .replace( ':agendaUid', agenda && agenda.uid )
          .replace( ':eventUid', event && event.uid ),
        {
          params: {
            ..._.pick( defaultQuery, 'type', 'typeIdentifier' ),
            ...query,
          }
        }
      )
    } );
  };
}

export function nextPage() {
  return ( { getState, dispatch } ) => {
    const { res, inbox, agenda, event, settings: { perPageLimit } } = getState();

    return dispatch( {
      types: [ NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL ],
      perPageLimit,
      promise: ( { client } ) => client.get(
        res.conversations.list
          .replace( ':slug', agenda && agenda.slug )
          .replace( ':agendaUid', agenda && agenda.uid )
          .replace( ':eventUid', event && event.uid ),
        {
          params: {
            ...inbox.query,
            page: inbox.page + 1
          }
        }
      )
    } );
  };
}
