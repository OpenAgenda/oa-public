import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';

const actionTypes = {
  LOAD: 'network-apps/network/LOAD',
  LOAD_SUCCESS: 'network-apps/network/LOAD_SUCCESS',
  SCHEMA_UPDATE: 'network-apps/network/SCHEMA_UPDATE'
}

export default _.assign( ( state = {}, action = {} ) => {

  switch ( action.type ) {
    case actionTypes.LOAD_SUCCESS:
      return _.pick( action, [ 'network', 'schema' ] );
    case actionTypes.SCHEMA_UPDATE:
      return ih( state, { schema: { $set: action.schema } } );
    default:
      return state;
  }

}, {
  load,
  updateSchema: schema => ( {
    type: actionTypes.SCHEMA_UPDATE,
    schema
  } )
} );

function load() {

  return async ( dispatch, getState, history ) => {

    const { config } = getState();

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
