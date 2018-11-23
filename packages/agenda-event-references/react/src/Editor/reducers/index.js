import search from './search';
import events from './events';
import suggestions from './suggestions';
import update from 'immutability-helper';

export default ( state = {}, action ) => {

  let newState = search( state, action );

  newState = events( newState, action );

  newState = suggestions( newState, action );

  return newState;

}
