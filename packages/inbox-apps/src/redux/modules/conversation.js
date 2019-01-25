import update from 'immutability-helper';

const LOAD = 'inbox-apps/conversation/LOAD';
const LOAD_SUCCESS = 'inbox-apps/conversation/LOAD_SUCCESS';
const LOAD_FAIL = 'inbox-apps/conversation/LOAD_FAIL';
const NEXT_PAGE = 'inbox-apps/conversation/NEXT_PAGE';
const NEXT_PAGE_SUCCESS = 'inbox-apps/conversation/NEXT_PAGE_SUCCESS';
const NEXT_PAGE_FAIL = 'inbox-apps/conversation/NEXT_PAGE_FAIL';
const SEND_MESSAGE = 'inbox-apps/conversation/SEND_MESSAGE';
const SEND_MESSAGE_SUCCESS = 'inbox-apps/conversation/SEND_MESSAGE_SUCCESS';
const SEND_MESSAGE_FAIL = 'inbox-apps/conversation/SEND_MESSAGE_FAIL';
const TRIGGER_ACTION = 'inbox-apps/conversation/TRIGGER_ACTION';
const TRIGGER_ACTION_SUCCESS = 'inbox-apps/conversation/TRIGGER_ACTION_SUCCESS';
const TRIGGER_ACTION_FAIL = 'inbox-apps/conversation/TRIGGER_ACTION_FAIL';
const RESUME = 'inbox-apps/conversation/RESUME';
const RESUME_SUCCESS = 'inbox-apps/conversation/RESUME_SUCCESS';
const RESUME_FAIL = 'inbox-apps/conversation/RESUME_FAIL';
const LOAD_AUTHOR = 'inbox-apps/conversation/LOAD_AUTHOR';
const LOAD_AUTHOR_SUCCESS = 'inbox-apps/conversation/LOAD_AUTHOR_SUCCESS';
const LOAD_AUTHOR_FAIL = 'inbox-apps/conversation/LOAD_AUTHOR_FAIL';
const ATTACH_FILE_TO_MESSAGE = 'inbox-apps/conversation/ATTACH_FILE_TO_MESSAGE';
const ATTACH_FILE_TO_MESSAGE_SUCCESS = 'inbox-apps/conversation/ATTACH_FILE_TO_MESSAGE_SUCCESS';
const ATTACH_FILE_TO_MESSAGE_FAIL = 'inbox-apps/conversation/ATTACH_FILE_TO_MESSAGE_FAIL';

const initialState = {
  loaded: false,
  author: false
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
        data: action.result.conversation,
        messages: action.result.messages,
        lastPage: action.result.messages.length < action.perPageLimit,
        page: 1,
        error: null,
        loading: false
      };
    case LOAD_FAIL:
      return {
        ...state,
        data: null,
        messages: null,
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
        messages: [ ...state.messages, ...action.result.messages ],
        lastPage: action.result.messages.length < action.perPageLimit,
        page: state.page + (action.result.messages.length ? 1 : 0),
        error: null,
        nextLoading: false
      };
    case NEXT_PAGE_FAIL:
      return {
        ...state,
        error: action.error,
        nextLoading: false
      };
    case SEND_MESSAGE:
      return state;
    case SEND_MESSAGE_SUCCESS:
      return {
        ...state,
        messages: [ action.result.message, ...state.messages ]
      };
    case SEND_MESSAGE_FAIL:
      return state;
    case TRIGGER_ACTION:
      return {
        ...state,
        actionLoading: true
      };
    case TRIGGER_ACTION_SUCCESS:
      return {
        ...state,
        data: action.result.conversation,
        actionError: null,
        actionLoading: false
      };
    case TRIGGER_ACTION_FAIL:
      return {
        ...state,
        actionError: action.error,
        actionLoading: false
      };
    case RESUME:
      return {
        ...state,
        resumeLoading: true
      };
    case RESUME_SUCCESS:
      return {
        ...state,
        data: action.result.conversation,
        resumeError: null,
        resumeLoading: false
      };
    case RESUME_FAIL:
      return {
        ...state,
        resumeError: action.error,
        resumeLoading: false
      };
    case LOAD_AUTHOR:
      return {
        ...state,
        authorFetching: true
      };
    case LOAD_AUTHOR_SUCCESS:
      return {
        ...state,
        author: action.result,
        authorFetching: false,
        authorFetchingError: false
      };
    case LOAD_AUTHOR_FAIL:
      return {
        ...state,
        author: false,
        authorFetching: false,
        authorFetchingError: action.error
      };
    case ATTACH_FILE_TO_MESSAGE_SUCCESS:
      const messageIndex = (state.messages || []).findIndex( v => v.id === action.messageId );

      return messageIndex === -1 // creation of conversation or not
        ? {
          ...state,
          messages: [ action.result.message ]
        }
        : update( state, { messages: { $splice: [ [ messageIndex, 1, action.result.message ] ] } } );
    default:
      return state;
  }
}

export function isLoaded( globalState ) {
  return globalState.conversation && globalState.conversation.loaded;
}

export function load( conversationId, query ) {
  return ( { getState, dispatch } ) => {
    const { res, agenda, event, settings: { perPageLimit } } = getState();

    return dispatch( {
      types: [ LOAD, LOAD_SUCCESS, LOAD_FAIL ],
      query,
      perPageLimit,
      promise: ( { client } ) =>
        client.get(
          res.messages.list
            .replace( ':slug', agenda && agenda.slug )
            .replace( ':agendaUid', agenda && agenda.uid )
            .replace( ':eventUid', event && event.uid )
            .replace( ':conversationId', conversationId ),
          { params: query }
        )
    } );
  };
}

export function isAuthorLoaded( globalState ) {
  return globalState.conversation && globalState.conversation.author;
}

export function loadAuthor() {
  return {
    types: [ LOAD_AUTHOR, LOAD_AUTHOR_SUCCESS, LOAD_AUTHOR_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res, agenda, event } = getState();

      return client.get(
        res.author
          .replace( ':slug', agenda && agenda.slug )
          .replace( ':agendaUid', agenda && agenda.uid )
          .replace( ':eventUid', event && event.uid )
      )
    }
  };
}

export function nextPage( conversationId ) {
  return ( { getState, dispatch } ) => {
    const { res, agenda, event, conversation, settings: { perPageLimit } } = getState();

    return dispatch( {
      types: [ NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL ],
      perPageLimit,
      promise: ( { client } ) =>
        client.get(
          res.messages.list
            .replace( ':slug', agenda && agenda.slug )
            .replace( ':agendaUid', agenda && agenda.uid )
            .replace( ':eventUid', event && event.uid )
            .replace( ':conversationId', conversationId ),
          {
            params: {
              ...conversation.query,
              page: conversation.page + 1
            }
          }
        )
    } );
  };
}

export function sendMessage( conversationId, data ) {
  return {
    types: [ SEND_MESSAGE, SEND_MESSAGE_SUCCESS, SEND_MESSAGE_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res, agenda, event } = getState();

      return client.post(
        res.messages.create
          .replace( ':slug', agenda && agenda.slug )
          .replace( ':agendaUid', agenda && agenda.uid )
          .replace( ':eventUid', event && event.uid )
          .replace( ':conversationId', conversationId ),
        data
      )
    }
  };
}

export function triggerAction( conversationId, code ) {
  return ( { getState, dispatch } ) => {
    const { settings, conversation, res, agenda, event } = getState();

    return dispatch( {
      types: [ TRIGGER_ACTION, TRIGGER_ACTION_SUCCESS, TRIGGER_ACTION_FAIL ],
      promise: ( { client, history } ) => client.get(
        res.conversations.action
          .replace( ':slug', agenda && agenda.slug )
          .replace( ':agendaUid', agenda && agenda.uid )
          .replace( ':eventUid', event && event.uid )
          .replace( ':conversationId', conversationId )
          .replace( ':code', code )
      )
        .then( result => {
          if ( code === 'removeTechnicalSupport' ) {
            history.push( settings.prefix );
            return { conversation: conversation.data };
          }

          return result;
        } )
    } );
  };
}

export function resume( conversationId ) {
  return {
    types: [ RESUME, RESUME_SUCCESS, RESUME_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res, agenda, event } = getState();

      return client.get(
        res.conversations.resume
          .replace( ':slug', agenda && agenda.slug )
          .replace( ':agendaUid', agenda && agenda.uid )
          .replace( ':eventUid', event && event.uid )
          .replace( ':conversationId', conversationId )
      );
    }
  };
}

export function attachFileToMessage( conversationId, messageId, file ) {
  return {
    types: [ ATTACH_FILE_TO_MESSAGE, ATTACH_FILE_TO_MESSAGE_SUCCESS, ATTACH_FILE_TO_MESSAGE_FAIL ],
    messageId,
    promise: ( { client }, { getState } ) => {
      const { res, agenda, event } = getState();

      return client.get(
        res.messages.addAttachment
          .replace( ':slug', agenda && agenda.slug )
          .replace( ':agendaUid', agenda && agenda.uid )
          .replace( ':eventUid', event && event.uid )
          .replace( ':conversationId', conversationId ),
        {
          params: {
            messageId,
            filename: file.meta.key,
            originalName: file.name
          }
        }
      );
    }
  };
}
