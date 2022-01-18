const INITIATE = 'agenda-locations/onGoin/INITIATE';
const CLOSE = 'ageanda-locations/onGoin/CLOSE';
const initialState = false;

export default function reducer(state = initialState, action) {
  console.log(action);
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
