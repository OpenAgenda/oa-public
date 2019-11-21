const SHOW = 'inbox-apps/modals/SHOW';
const SET = 'inbox-apps/modals/SET';
const CLOSE = 'inbox-apps/modals/CLOSE';

const initialState = {};

export default function reducer( state = initialState, action ) {
  switch ( action.type ) {
    case SHOW:
      return {
        ...state,
        [ action.name ]: {
          visible: true,
          params: action.params
        }
      };
    case SET:
      return {
        ...state,
        [ action.name ]: {
          ...state[ action.name ],
          params: {
            ...state[ action.name ].params,
            ...action.params
          }
        }
      };
    case CLOSE:
      return {
        ...state,
        [ action.name ]: {
          ...state[ action.name ],
          visible: false
        }
      };
    default:
      return state;
  }
}

export function showModal( name, params = {} ) {
  return {
    type: SHOW,
    name,
    params
  };
}

export function setModal( name, params = {} ) {
  return {
    type: SET,
    name,
    params
  };
}

export function closeModal( name ) {
  return {
    type: CLOSE,
    name
  };
}
