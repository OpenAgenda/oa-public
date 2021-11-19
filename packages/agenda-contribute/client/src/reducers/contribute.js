const actionTypes = {
  EVENT_CREATE_SUCCESS: 'agenda-contribute/EVENT_CREATE_SUCCESS'
};

function reducer(state = {}, action = {}) {
  switch (action.type) {
    case actionTypes.EVENT_CREATE_SUCCESS:
      return {
        ...state,
        createdEvent: action.event
      };
    default:
      return state;
  }
}

function eventCreateSuccess({ agenda, response }) {
  return ({ history }, { dispatch, getState }) => {
    const { prefix } = getState();

    const { event } = response.body;

    dispatch({
      type: actionTypes.EVENT_CREATE_SUCCESS,
      event
    });

    history.push({
      ...history.location,
      pathname: `${prefix.replace(':agendaSlug', agenda.slug)}/confirmation`
    });
  };
}

export default Object.assign(reducer, {
  eventCreateSuccess
});
