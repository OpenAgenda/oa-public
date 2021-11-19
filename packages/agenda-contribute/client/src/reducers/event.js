import sa from 'superagent';

const actionTypes = {
  ADD: 'agenda-contribute/event/ADD',
  CREATE: 'agenda-contribute/event/CREATE',
  UPDATE: 'agenda-contribute/event/UPDATE'
};

function reducer(state = {}, action = {}) {
  switch (action.type) {
    case actionTypes.CREATE:
      console.log('reducer.create');
      return {
        ...state,
        createdEvent: action.event
      };
    case actionTypes.UPDATE:
    case actionTypes.ADD:
      return action.event;
    default:
      return state;
  }
}

function deleteDraft() {
  return (dispatch, getState) => {
    sa.delete('').then(() => {
      window.location.href = getState()?.config?.redirects?.draft;
    });
  }
}

function close() {
  return (dispatch, getState) => {
    const {
      config: {
        redirects
      },
      event
    } = getState();
    doRedirect(
      redirects,
      event
    );
  }
}

function redirect(values, response) {
  return (dispatch, getState) => doRedirect(
    getState().config.redirects,
    response.body.event
  );
}

function doRedirect(redirects, event) {
  if (redirects?.back) {
    window.location.href = redirects.back;
  } else {
    window.location.href = redirects.seeEvent.replace(':eventUid', event.uid);
  }
}


export default Object.assign(reducer, {
  updated: redirect,
  added: redirect,
  close,
  deleteDraft,
  types: actionTypes
});
