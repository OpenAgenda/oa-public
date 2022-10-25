import axios from 'axios';
import debug from 'debug';
import utils from '../lib/utils';

const log = debug('contribute');

const {
  doRedirect
} = utils;

const EVENT_CREATE_SUCCESS = 'agenda-contribute/EVENT_CREATE_SUCCESS';
const EVENT_SHARE_SUCCESS = 'agenda-contribute/EVENT_SHARE_SUCCESS';
const EVENT_SHARE_DISPLAY_EVENT_FIELDS = 'agenda-contribute/EVENT_SHARE_DISPLAY_EVENT_FIELDS';
const REDIRECTING = 'agenda-contribute/REDIRECTING';

function reducer(state = {}, action = {}) {
  switch (action.type) {
    case EVENT_CREATE_SUCCESS:
      return {
        ...state,
        createdEvent: action.event
      };
    case EVENT_SHARE_SUCCESS:
      return {
        ...state,
        sharedEvent: action.sharedEvent
      };
    case EVENT_SHARE_DISPLAY_EVENT_FIELDS:
      return {
        ...state,
        requestedDisplayEventFieldsInShare: true
      };
    case REDIRECTING:
      return {
        ...state,
        redirecting: true
      };
    default:
      return state;
  }
}

function displayShareSuccess(sharedEvent) {
  return {
    type: EVENT_SHARE_SUCCESS,
    sharedEvent
  };
}

function launchImmediateEventShare(shareRes) {
  return (_, { dispatch }) => {
    axios.post(shareRes).then(response => {
      dispatch(displayShareSuccess(response.data.event));
    });
  };
}

function displayEventFieldsInShare() {
  return {
    type: EVENT_SHARE_DISPLAY_EVENT_FIELDS
  };
}

function eventCreateSuccess({ agenda, response }) {
  return ({ history, location }, { dispatch, getState }) => {
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
      return doRedirect(history, location, res.showMyEvents);
    }

    dispatch({
      type: EVENT_CREATE_SUCCESS,
      event
    });

    history.push({
      ...history.location,
      pathname: `${prefix.replace(':slug', agenda.slug)}/confirmation`
    });
  };
}

function eventDelete({ agenda, event }) {
  return ({ history, location }, { getState, dispatch }) => {
    const {
      res: {
        removeEvent: removeRes,
        showMyEvents: showMyEventsRes
      }
    } = getState();

    axios.delete(
      removeRes
        .replace(':agendaUid', agenda.uid)
        .replace(':eventUid', event.uid)
    ).then(() => {
      dispatch({
        type: REDIRECTING
      });
      doRedirect(history, location, showMyEventsRes);
    });
  };
}

function eventUpdateSuccess({ agenda, response }) {
  return ({ history, location }, { getState }) => {
    const { res } = getState();

    const {
      event
    } = response.body;

    return doRedirect(
      history,
      location,
      res.showEvent
        .replace(':agendaUid', agenda.uid)
        .replace(':eventUid', event.uid)
    );
  };
}

function memberSetSuccess({
  agenda,
  queryClient,
  mode = 'create',
  fromAgenda = null,
  event = null
}) {
  console.log('memberSetSuccess');
  return ({ history, location }, { getState }) => {
    const {
      settings: {
        prefix
      }
    } = getState();
    queryClient.removeQueries(`agendaContext.${agenda.uid}`);
    const newPathname = mode === 'create' ? (
      `${prefix.replace(':slug', agenda.slug)}/event`
    ) : (
      `${prefix.replace(':slug', agenda.slug)}/event/${event.uid}/from/${fromAgenda.uid}`
    );
    log('member set was successful, moving on to %s', newPathname);
    history.push({
      ...location,
      pathname: newPathname
    });
  };
}

function goBackOrToEvent({ agenda, event }) {
  return ({ history, location }, { getState }) => {
    const { res } = getState();

    return doRedirect(
      history,
      location,
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
  goBackOrToEvent,
  launchImmediateEventShare,
  displayEventFieldsInShare,
  displayShareSuccess,
  eventDelete
});
