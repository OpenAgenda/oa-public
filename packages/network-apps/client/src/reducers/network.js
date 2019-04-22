import _ from 'lodash';
import sa from 'superagent';

const actionTypes = {
  LOAD: 'network-apps/network/LOAD',
  LOAD_SUCCESS: 'network-apps/network/LOAD_SUCCESS'
}

export default _.assign( ( state = {}, action = {} ) => {

  switch ( action.type ) {
    case actionTypes.LOAD_SUCCESS:
      return _.pick( action, [ 'network', 'schema' ] );
    default:
      return state;
  }

}, {
  load
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
