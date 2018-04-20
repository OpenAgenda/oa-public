const SET_MODAL = 'agenda-settings/modal/SET_MODAL';

const initialState = {
  visible: false
};

export default function reducer( state = initialState, action ) {

  switch ( action.type ) {
    case SET_MODAL:
      return {
        ...state,
        ...action.options
      };
    default:
      return state;
  }

}

export function setModal( options ) {
  return {
    type: SET_MODAL,
    options
  }
}
