const SET_TAB = 'home/menu/SET_TAB';

const initialState = {
  tab: null
};

export default function reducer( state = initialState, action ) {
  switch ( action.type ) {
    case SET_TAB:
      return {
        ...state,
        tab: action.tab
      };
    default:
      return state;
  }
}

export function setTab( tab ) {
  return {
    type: SET_TAB,
    tab
  };
}
