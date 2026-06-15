import _ from 'lodash';
import ih from 'immutability-helper';
import ky from 'ky';
import { dispatchError } from './main.js';

const actionTypes = [
  'LOAD',
  'LOAD_SUCCESS',
  'SCHEMA_UPDATE',
  'LOAD_AGENDAS',
  'LOAD_AGENDAS_SUCCESS',
  'ADD_AGENDA_SHOW',
  'ADD_AGENDA_CLOSE',
  'ADD_AGENDA_SUCCESS',
  'CREATE_AGENDA_SHOW',
  'CREATE_AGENDA_CLOSE',
  'CREATE_AGENDA_SUCCESS',
  'REMOVE_AGENDA_SHOW',
  'REMOVE_AGENDA_CLOSE',
  'REMOVE_AGENDA_SUCCESS',
].reduce((a, v) => _.set(a, v, `network-apps/network/${v}`), {});

async function _post({ dispatch, successType, res, data, failType }) {
  const successDispatch = {
    type: successType,
  };

  try {
    const response = await ky.post(res, { json: data }).json();

    Object.assign(successDispatch, { agenda: response });
  } catch (e) {
    dispatch({ type: failType });
    return dispatchError(dispatch, e);
  }

  dispatch(successDispatch);
}

function loadAgendas() {
  return async (dispatch, getState, history) => {
    dispatch({
      type: actionTypes.LOAD_AGENDAS,
    });

    const successDispatch = { type: actionTypes.LOAD_AGENDAS_SUCCESS };

    try {
      const { network, agendas, credentialsSchema } = await ky(
        history.location.pathname,
      ).json();

      _.assign(successDispatch, { network, agendas, credentialsSchema });
    } catch (e) {
      return dispatchError(dispatch, e);
    }

    dispatch(successDispatch);
  };
}

function submitAddAgenda(slugOrUrl, { credentials, official } = {}) {
  return (dispatch, getState, history) =>
    _post({
      dispatch,
      successType: actionTypes.ADD_AGENDA_SUCCESS,
      res: `${history.location.pathname}/add`,
      data: { slugOrUrl, credentials, official },
      failType: actionTypes.ADD_AGENDA_CLOSE,
    });
}

function submitCreateAgenda(agenda) {
  return (dispatch, _getState, _history) =>
    _post({
      dispatch,
      successType: actionTypes.CREATE_AGENDA_SUCCESS,
      res: '',
      data: agenda,
      failType: actionTypes.CREATE_AGENDA_CLOSE,
    });
}

function submitRemoveAgenda(agenda) {
  return (dispatch, getState, history) =>
    _post({
      dispatch,
      successType: actionTypes.REMOVE_AGENDA_SUCCESS,
      res: `${history.location.pathname}/remove/${agenda.uid}`,
      failType: actionTypes.REMOVE_AGENDA_CLOSE,
    });
}

function load() {
  return async (dispatch, getState, history) => {
    dispatch({
      type: actionTypes.LOAD,
    });

    const successDispatch = {
      type: actionTypes.LOAD_SUCCESS,
    };

    try {
      const { schema, network } = await ky(history.location.pathname).json();

      _.assign(successDispatch, { schema, network });
    } catch (e) {
      return dispatchError(dispatch, e);
    }

    dispatch(successDispatch);
  };
}

const showAddAgenda = () => ({ type: actionTypes.ADD_AGENDA_SHOW });
const closeAddAgenda = () => ({ type: actionTypes.ADD_AGENDA_CLOSE });
const showCreateAgenda = () => ({ type: actionTypes.CREATE_AGENDA_SHOW });
const closeCreateAgenda = () => ({ type: actionTypes.CREATE_AGENDA_CLOSE });
const updateSchema = (schema) => ({
  type: actionTypes.SCHEMA_UPDATE,
  schema,
});
const showRemoveAgenda = (agendaUid) => ({
  type: actionTypes.REMOVE_AGENDA_SHOW,
  agendaUid,
});
const closeRemoveAgenda = () => ({ type: actionTypes.REMOVE_AGENDA_SHOW });

export default (state = {}, action = {}) => {
  switch (action.type) {
    case actionTypes.LOAD_SUCCESS:
      return _.pick(action, ['network', 'schema']);

    case actionTypes.SCHEMA_UPDATE:
      return ih(state, { schema: { $set: action.schema } });

    case actionTypes.LOAD:
      return ih(state, { $unset: ['agendas', 'network'] });

    case actionTypes.LOAD_AGENDAS:
      return ih(state, { $unset: ['agendas', 'network'] });

    case actionTypes.LOAD_AGENDAS_SUCCESS:
      return ih(state, {
        agendas: { $set: action.agendas },
        network: { $set: action.network },
        credentialsSchema: { $set: action.credentialsSchema },
      });

    case actionTypes.ADD_AGENDA_SHOW:
      return ih(state, { add: { $set: true } });

    case actionTypes.ADD_AGENDA_SUCCESS:
      return ih(state, {
        add: { $set: false },
        agendas: { $splice: [[0, 0, action.agenda]] },
      });

    case actionTypes.ADD_AGENDA_CLOSE:
      return ih(state, { add: { $set: null } });

    case actionTypes.CREATE_AGENDA_SHOW:
      return ih(state, { create: { $set: true } });

    case actionTypes.CREATE_AGENDA_SUCCESS:
      return ih(state, {
        create: { $set: null },
        agendas: { $splice: [[0, 0, action.agenda]] },
      });

    case actionTypes.CREATE_AGENDA_CLOSE:
      return ih(state, { create: { $set: null } });

    case actionTypes.REMOVE_AGENDA_SHOW:
      return ih(state, {
        remove: { $set: action.agendaUid },
      });

    case actionTypes.REMOVE_AGENDA_SUCCESS: {
      const removedIndex = _.findIndex(
        state.agendas,
        (a) => a.uid === action.agenda.uid,
      );
      return ih(state, {
        remove: { $set: null },
        agendas: { $splice: [[removedIndex, 1]] },
      });
    }

    default:
      return state;
  }
};

export {
  load,
  loadAgendas,
  showAddAgenda,
  closeAddAgenda,
  submitAddAgenda,
  showCreateAgenda,
  closeCreateAgenda,
  submitCreateAgenda,
  updateSchema,
  showRemoveAgenda,
  closeRemoveAgenda,
  submitRemoveAgenda,
};
