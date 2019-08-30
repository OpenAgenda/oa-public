const SHOW = 'member-apps/modals/SHOW';
const SET = 'member-apps/modals/SET';
const CLOSE = 'member-apps/modals/CLOSE';

const initialState = {};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SHOW:
      return {
        ...state,
        [action.name]: {
          ...action.options,
          visible: true
        }
      };
    case SET:
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          ...action.options
        }
      };
    case CLOSE:
      return {
        ...state,
        [action.name]: {
          ...state[action.name],
          visible: false
        }
      };
    default:
      return state;
  }
}

export function showModal(name, options = {}) {
  return {
    type: SHOW,
    name,
    options
  };
}

export function setModal(name, options = {}) {
  return {
    type: SET,
    name,
    options
  };
}

export function closeModal(name) {
  return {
    type: CLOSE,
    name
  };
}
