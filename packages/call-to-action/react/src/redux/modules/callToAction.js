const OPEN_REQUEST_FORM = 'CALL_TO_ACTION/OPEN_REQUEST_FORM';
const CLOSE_REQUEST_FORM = 'CALL_TO_ACTION/CLOSE_REQUEST_FORM';
const SEND_REQUEST = 'CALL_TO_ACTION/SEND_REQUEST';
const SEND_REQUEST_SUCCESS = 'CALL_TO_ACTION/SEND_REQUEST_SUCCESS';
const SEND_REQUEST_FAIL = 'CALL_TO_ACTION/SEND_REQUEST_FAIL';

const initialState = {
  opened: false
};

export default function reducer( state = initialState, action ) {

  switch ( action.type ) {
    case OPEN_REQUEST_FORM:
      return {
        ...state,
        opened: true,
        subject: action.subject,
        agenda: action.agenda,
        options: action.options
      };
    case CLOSE_REQUEST_FORM:
      return {
        ...state,
        opened: false,
        subject: null,
        agenda: null,
        options: null
      }
    default:
      return state;
  }

};

export function openRequestForm( { subject, agenda }, options ) {
  return {
    type: OPEN_REQUEST_FORM,
    subject,
    agenda,
    options
  };
}

export function closeRequestForm() {
  return {
    type: CLOSE_REQUEST_FORM
  };
}

export function sendRequestForm( data ) {
  return {
    types: [ SEND_REQUEST, SEND_REQUEST_SUCCESS, SEND_REQUEST_FAIL ],
    promise: ( client, { res } ) => client.post( res.request, { data } )
  }
}
