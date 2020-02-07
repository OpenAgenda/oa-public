const SHOW = 'aggregator-sources/modals/SHOW';
const CLOSE = 'aggregator-sources/modals/CLOSE';

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

export function closeModal(name) {
  return {
    type: CLOSE,
    name
  };
}
