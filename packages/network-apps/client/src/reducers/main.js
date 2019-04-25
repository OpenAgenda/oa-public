import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';

const actionTypes = [
  'LOAD',
  'LOAD_SUCCESS',
  'ADD',
  'ADD_CHANGE',
  'ADD_SUBMIT',
  'SERVER_ERROR'
].reduce( ( a, v ) => _.set( a, v, `network-apps/network/${v}` ), {} );

export default _.assign( ( state = {}, action = {} ) => {

  switch ( action.type ) {
    case actionTypes.LOAD_SUCCESS:
      return _.pick( action, 'networks' );

    case actionTypes.ADD:
      return ih( state, { add: { $set: {} } } );

    case actionTypes.ADD_CHANGE:
      return ih( state, { add: _.set( {}, action.field, { $set: action.value } ) } );

    case actionTypes.SERVER_ERROR:
      return ih( state, { error: { $set: action.error } } );

    default:
      return state;
  }

}, {
  load,
  add: () => ( { type: actionTypes.ADD } ),
  addChange: ( field, value ) => ( { type: actionTypes.ADD_CHANGE, field, value } ),
  addSubmit,
  actionTypes
} );

function addSubmit( e ) {

  e.preventDefault();

  return async ( dispatch, getState ) => {

    const { main: { add } } = getState();

    await sa.post( getState().config.base, add );

    return load()( dispatch, getState );

  }

}

function load() {

  return async ( dispatch, getState ) => {

    const { body: networks } = await sa
      .get( getState().config.base )
      .set( 'Accept', 'application/json' );

    dispatch( {
      type: actionTypes.LOAD_SUCCESS,
      networks
    } );

  }

}
