const OPEN_CONVERSATION_FORM = 'inbox-apps/conversationForm/OPEN_CONVERSATION_FORM';
const CLOSE_CONVERSATION_FORM = 'inbox-apps/conversationForm/CLOSE_CONVERSATION_FORM';
const CREATE_CONVERSATION = 'inbox-apps/conversationForm/CREATE_CONVERSATION';
const CREATE_CONVERSATION_SUCCESS = 'inbox-apps/conversationForm/CREATE_CONVERSATION_SUCCESS';
const CREATE_CONVERSATION_FAIL = 'inbox-apps/conversationForm/CREATE_CONVERSATION_FAIL';

const initialState = {
  opened: false,
  data: {}
};

export default function reducer( state = initialState, action ) {
  switch ( action.type ) {
    case OPEN_CONVERSATION_FORM:
      return {
        ...state,
        opened: true,
        data: action.data
      };
    case CLOSE_CONVERSATION_FORM:
      return {
        ...state,
        opened: false,
        data: {}
      }
    default:
      return state;
  }
};

export function openConversationForm( data ) {
  return {
    type: OPEN_CONVERSATION_FORM,
    data
  };
}

export function closeConversationForm() {
  return {
    type: CLOSE_CONVERSATION_FORM
  };
}

export function createConversation( data ) {
  return {
    types: [ CREATE_CONVERSATION, CREATE_CONVERSATION_SUCCESS, CREATE_CONVERSATION_FAIL ],
    promise: ( { client }, { getState } ) => {
      const { res, agenda, event } = getState();

      return client.post(
        res.conversations.create
          .replace( ':slug', agenda && agenda.slug )
          .replace( ':agendaUid', agenda && agenda.uid )
          .replace( ':eventUid', event && event.uid ),
        data
      );
    }
  };
}
