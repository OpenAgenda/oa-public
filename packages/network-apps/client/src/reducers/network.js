import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';

const actionTypes = {
  LOAD: 'network-apps/network/LOAD',
  LOAD_SUCCESS: 'network-apps/network/LOAD_SUCCESS',
  SCHEMA_UPDATE: 'network-apps/network/SCHEMA_UPDATE',
  LOAD_AGENDAS: 'network-apps/network/LOAD_AGENDAS',
  LOAD_AGENDAS_SUCCESS: 'network-apps/network/LOAD_AGENDAS_SUCCESS'
}

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
    default:
      return state;
  }

}, {
  load,
  loadAgendas,
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

    const { body: { network, agendas } } = await sa
      .get( history.location.pathname )
      .set( 'Accept', 'application/json' );

    dispatch( {
      type: actionTypes.LOAD_AGENDAS_SUCCESS,
      agendas,
      network
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
