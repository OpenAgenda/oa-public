import _ from 'lodash';
import sa from 'superagent';

const actionTypes = {
  ADD: 'agenda-contribute/event/ADD',
  CREATE: 'agenda-contribute/event/CREATE',
  UPDATE: 'agenda-contribute/event/UPDATE'
};

module.exports = Object.assign(reducer, {
  created,
  updated: redirect,
  added: redirect,
  deleteDraft,
  actionTypes
});


function reducer(state = {}, action = {}) {
  switch (action.type) {
    case actionTypes.CREATE:
    case actionTypes.UPDATE:
    case actionTypes.ADD:
      return action.event;
  }

  return state;
}


function deleteDraft() {
  return (dispatch, getState) => {
    sa.delete('').then(() => {
      window.location.href = getState()?.config?.redirects?.draft;
    });
  }
}


function redirect(values, response) {
  return (dispatch, getState) => {
    const {
      redirects,
      fromAgenda
    } = getState().config;

    const event = response.body.event;

    if (event?.draft) {
      window.location.href = redirects?.draft;
      return;
    }

    if (redirects?.updated) {
      window.location.href = redirects.updated;
    } else {
      window.location.href = redirects.seeEvent.replace(':eventUid', event.uid);
    }
  }
}


/**
 * member data save was confirmed by server
 */

function created(values, response) {
  return (dispatch, getState, history) => {
    const state = getState();

    const { base } = state.config;

    const event = response?.body?.event;

    if (event?.draft) {
      window.location.href = state.config.redirects.draft;
      return;
    }

    dispatch({
      type: actionTypes.CREATE,
      event
    });

    return history.push(base + '/confirmation');
  }
}
