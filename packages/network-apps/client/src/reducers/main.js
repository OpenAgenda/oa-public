import _ from 'lodash';
import sa from 'superagent';

const actionTypes = {
  LOAD: 'network-apps/main/LOAD',
  LOAD_SUCCESS: 'network-apps/main/LOAD_SUCCESS'
}

export default _.assign( ( state = {}, action = {} ) => {

  switch ( action.type ) {
    case actionTypes.LOAD_SUCCESS:
      return _.pick( action, 'networks' );
    default:
      return state;
  }

}, {
  load
} );

function load() {

  return async ( dispatch, getState, history ) => {

    const { body: networks } = await sa
      .get( history.location.pathname )
      .set( 'Accept', 'application/json' );

    dispatch( {
      type: actionTypes.LOAD_SUCCESS,
      networks
    } );

  }

}
