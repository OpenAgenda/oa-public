import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';

const actionTypes = [
  'LOAD',
  'LOAD_SUCCESS',
  'SCHEMA_UPDATE',
  'LOAD_AGENDAS',
  'LOAD_AGENDAS_SUCCESS',
  'SHOW_ADD_AGENDA',
  'CLOSE_ADD_AGENDA',
  'ADD_AGENDA_SUCCESS'
].reduce( ( a, v ) => _.set( a, v, `network-apps/network/${v}` ), {} );

const mainTypes = require( './main' ).actionTypes

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

    case actionTypes.SHOW_ADD_AGENDA:
      return ih( state, {
        add: { $set: true }
      } );

    case actionTypes.ADD_AGENDA_SUCCESS:
      return ih( state, {
        add: { $set: false },
        agendas: { $push: [ action.agenda ] }
      } );

    default:
      return state;
  }

}, {
  load,
  loadAgendas,
  showAddAgenda: () => ( {
    type: actionTypes.SHOW_ADD_AGENDA
  } ),
  closeAddAgenda: () => ( { type: actionTypes.CLOSE_ADD_AGENDA } ),
  submitAddAgenda,
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

    const successDispatch = {
      type: actionTypes.LOAD_AGENDAS_SUCCESS,
    };

    try {
      const { body: { network, agendas } } = await sa
        .get( history.location.pathname )
        .set( 'Accept', 'application/json' );

      _.assign( successDispatch, { network, agendas } );
    } catch ( e ) {
      return dispatch( {
        type: mainTypes.SERVER_ERROR,
        error: _.get( e, 'response.body.message', e.message )
      } );
    }

    dispatch( successDispatch );

  }

}

function submitAddAgenda( slugOrUrl ) {

  return async ( dispatch, getState, history ) => {

    const res = await sa.post( history.location.pathname, { slugOrUrl } );

    dispatch( {
      type: actionTypes.ADD_AGENDA_SUCCESS,
      agenda: res.body
    } );

  }

}

function load() {

  return async ( dispatch, getState, history ) => {

    const { body: { schema, network } } = await sa
      .get( history.location.pathname )
      .set( 'Accept', 'application/json' );

    dispatch( {
      type: actionTypes.LOAD_SUCCESS,
      network,
      schema
    } );

  }

}
