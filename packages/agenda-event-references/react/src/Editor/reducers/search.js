import update from 'immutability-helper';

import { excludeEventsWithUids, formatEventItem } from './helpers';

export default ( state = {}, action ) => {

  switch ( action.type ) {

    case 'SEARCH_REQUEST':

      return update( state, {
        search: {
          searching: { $set: true },
          query: { $set: action.query }
        }
      } );

    case 'SEARCH_FAILED':

      return update( state, {
        search: {
          searching: { $set: false },
          error: { $set: action.error }
        }
      } );

    case 'SEARCH_SUCCESS':

      return update( state, {
        search: {
          searching: { $set: false },
          query: { $set: action.query },
          events: { $set:
            action.events
              .filter( excludeEventsWithUids.bind( null, state.events.map( e => e.uid ) ) )
              .map( formatEventItem.bind( null, state.lang ) )
          }
        }
      } );

    case 'SEARCH_SHOW':

      return update( state, {
        search: {
          display: { $set: true }
        }
      } );

    case 'SEARCH_HIDE':

      return update( state, {
        search: {
          display: { $set: false }
        }
      } );

    default:

      return state;

  }

}
