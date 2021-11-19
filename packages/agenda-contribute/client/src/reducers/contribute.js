import utils from '../lib/utils';

const {
  doRedirect
} = utils;

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
    const { prefix, res } = getState();

    const {
      event
    } = response.body;

    if (event.draft) {
      return doRedirect(history, res.showMyEvents);
    }

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

function eventUpdateSuccess({ agenda, response }) {
  return ({ history }, { getState }) => {
    const { res } = getState();

    const {
      event
    } = response.body;

    return doRedirect(
      history,
      res.showEvent
        .replace(':agendaUid', agenda.uid)
        .replace(':eventUid', event.uid)
    );
  };
}

function memberSetSuccess({ agenda, queryClient }) {
  return ({ history }, { getState }) => {
    const { prefix } = getState();
    history.push({
      ...history.location,
      pathname: `${prefix.replace(':agendaSlug', agenda.slug)}/event`
    });
    queryClient.removeQueries('member');
  };
}

export default Object.assign(reducer, {
  eventCreateSuccess,
  memberSetSuccess,
  eventUpdateSuccess
});
