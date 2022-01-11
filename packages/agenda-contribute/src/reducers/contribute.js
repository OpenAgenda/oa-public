import axios from 'axios';
import debug from 'debug';
import utils from '../lib/utils';

const log = debug('contribute');

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
    case actionTypes.EVENT_SHARE_SUCCESS:
      return {
        ...state,
        sharedEvent: action.event
      };
    default:
      return state;
  }
}

function launchImmediateEventShare(shareRes) {
  return ({}, { dispatch }) => {
    axios.post(shareRes).then(response => {
      dispatch({
        type: actionTypes.EVENT_SHARE_SUCCESS,
        sharedEvent: response.event
      });
    });
  };
}

function eventCreateSuccess({ agenda, response }) {
  return ({ history }, { dispatch, getState }) => {
    const {
      res,
      settings: {
        prefix
      }
    } = getState();

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
      pathname: `${prefix.replace(':slug', agenda.slug)}/confirmation`
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
    const {
      settings: {
        prefix
      }
    } = getState();
    queryClient.removeQueries('agendaContext');
    log('member set was successful, moving on to event step');
    history.push({
      ...history.location,
      pathname: `${prefix.replace(':slug', agenda.slug)}/event`
    });
  };
}

function eventShareSuccess({ agenda, response }) {
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

function goBackOrToEvent({ agenda, event }) {
  return ({ history }, { getState }) => {
    const { res } = getState();

    return doRedirect(
      history,
      res.showEvent
        .replace(':agendaUid', agenda.uid)
        .replace(':eventUid', event.uid)
    );
  };
}

export default Object.assign(reducer, {
  eventCreateSuccess,
  memberSetSuccess,
  eventUpdateSuccess,
  eventShareSuccess,
  goBackOrToEvent,
  launchImmediateEventShare
});
