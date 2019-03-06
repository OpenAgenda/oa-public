const initialState = {};

// Action types
const SET_TYPE = 'header/SET_TYPE';

export default ( state = initialState, action ) => {
  switch ( action.type ) {
    case SET_TYPE:
      return {
        ...state,
        type: action.payload.type
      };
  }

  return state;
}

// Actions
export function setType( type ) {
  return {
    type: SET_TYPE,
    payload: {
      type
    }
  };
}
