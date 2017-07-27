const SHOW = 'activity-apps/modals/SHOW';
const CLOSE = 'activity-apps/modals/CLOSE';

const initialState = {};

export default function reducer( state = initialState, action ) {
  switch ( action.type ) {
    case SHOW:
      return {
        ...state,
        [action.name]: {
          options: action.options,
          visible: true
        }
      };
    case CLOSE:
      return {
        ...state,
        [action.name]: {
          options: state[action.name].options,
          visible: false
        }
      };
    default:
      return state;
  }
}

export function showModal( name, options = {} ) {
  return {
    type: SHOW,
    name,
    options
  };
}

export function closeModal( name ) {
  return {
    type: CLOSE,
    name
  };
}
