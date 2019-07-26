import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';

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
].reduce( ( a, v ) => _.set( a, v, `network-apps/network/${v}` ), {} );

const { dispatchError } = require( './main' );

export default _.assign( ( state = {}, action = {} ) => {

  switch ( action.type ) {
    case actionTypes.LOAD_SUCCESS:
      return _.pick( action, [ 'network', 'schema' ] );

    case actionTypes.SCHEMA_UPDATE:
      return ih( state, { schema: { $set: action.schema } } );

    case actionTypes.LOAD_AGENDAS:
      return ih( state, { $unset: [ 'agendas', 'network' ] } );

    case actionTypes.LOAD_AGENDAS_SUCCESS:
      return ih( state, {
        agendas: { $set: action.agendas },
        network: { $set: action.network }
      } );

    case actionTypes.ADD_AGENDA_SHOW:
      return ih( state, { add: { $set: true } } );

    case actionTypes.ADD_AGENDA_SUCCESS:
      return ih( state, {
        add: { $set: false },
        agendas: { $splice: [ [ 0, 0, action.agenda ] ] }
      } );

    case actionTypes.ADD_AGENDA_CLOSE:
      return ih( state, { add: { $set: null } } );

    case actionTypes.CREATE_AGENDA_SHOW:
      return ih( state, { create: { $set: true } } );

    case actionTypes.CREATE_AGENDA_SUCCESS:
      return ih( state, {
        create: { $set: null },
        agendas: { $splice: [ [ 0, 0, action.agenda ] ] }
      } );

    case actionTypes.CREATE_AGENDA_CLOSE:
      return ih( state, { create: { $set: null } } );

    default:
      return state;
  }

}, {
  load,
  loadAgendas,
  showAddAgenda: () => ( { type: actionTypes.ADD_AGENDA_SHOW } ),
  closeAddAgenda: () => ( { type: actionTypes.ADD_AGENDA_CLOSE } ),
  submitAddAgenda,
  showCreateAgenda: () => ( { type: actionTypes.CREATE_AGENDA_SHOW } ),
  closeCreateAgenda: () => ( { type: actionTypes.CREATE_AGENDA_CLOSE } ),
  submitCreateAgenda,
  updateSchema: schema => ( {
    type: actionTypes.SCHEMA_UPDATE,
    schema
  } )
} );

function loadAgendas() {

  return async ( dispatch, getState, history ) => {

    dispatch( {
      type: actionTypes.LOAD_AGENDAS,
    } );

    const successDispatch = { type: actionTypes.LOAD_AGENDAS_SUCCESS };

    try {
      const { body: { network, agendas } } = await sa
        .get( history.location.pathname )
        .set( 'Accept', 'application/json' );

      _.assign( successDispatch, { network, agendas } );
    } catch ( e ) {
      return dispatchError( dispatch, e );
    }

    dispatch( successDispatch );

  }

}

function submitAddAgenda( slugOrUrl ) {

  return ( dispatch, getState, history ) => _post( {
    dispatch,
    successType: actionTypes.ADD_AGENDA_SUCCESS,
    res: history.location.pathname + '/add',
    data: { slugOrUrl },
    failType: actionTypes.ADD_AGENDA_CLOSE
  } );

}

function submitCreateAgenda( agenda ) {

  return ( dispatch, getState, history ) => _post( {
    dispatch,
    successType: actionTypes.CREATE_AGENDA_SUCCESS,
    res: '',
    data: agenda,
    failType: actionTypes.CREATE_AGENDA_CLOSE
  } );

}

async function _post( { dispatch, successType, res, data, failType } ) {

  const successDispatch = {
    type: successType
  };

  try {
    const response = await sa.post( res, data ).set( 'Accept', 'application/json' );

    _.assign( successDispatch, { agenda: response.body } );
  } catch ( e ) {
    dispatch( { type: failType } );
    return dispatchError( dispatch, e );
  }

  dispatch( successDispatch );

}

function load() {

  return async ( dispatch, getState, history ) => {

    const successDispatch = {
      type: actionTypes.LOAD_SUCCESS
    }

    try {
      const { body: { schema, network } } = await sa
        .get( history.location.pathname )
        .set( 'Accept', 'application/json' );

      _.assign( successDispatch, { schema, network } );
    } catch ( e ) {
      return dispatchError( dispatch, e );
    }

    dispatch( successDispatch );

  }

}
