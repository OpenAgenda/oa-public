const INITIATE = 'agenda-locations/onGoing/INITIATE';
const CLOSE = 'ageanda-locations/onGoing/CLOSE';
const initialState = false;

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case INITIATE:
      return {
        ...state,
        name: action.name
      };
    case CLOSE:
      return false;
    default:
      return state;
  }
}

export function initiate(name) {
  return {
    type: INITIATE,
    name
  };
}

export function close() {
  return {
    type: CLOSE,
  };
}
