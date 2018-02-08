"use strict";

import update from 'immutability-helper';

import { excludeEventsWithUids, formatEventItem } from './helpers';

const _ = {
  isEqual: require( 'lodash/isEqual' )
}

export default ( state = {}, action ) => {

  switch ( action.type ) {

    case 'SUGGESTION_REQUEST':

      return update( state, {
        search: {
          searching: { $set: true }
        },
        loadingSuggestions: { $set: true }
      } )

      break;

    case 'SUGGESTION_REQUEST_FAILED':

      return update( state, {
        search: {
          searching: { $set: false },
          error: { $set: action.error }
        }
      } );

      break;

    case 'SUGGESTION_REQUEST_SUCCESS':

      return update( state, {
        search: {
          searching: { $set: false },
          error: { $set: null },
          suggestions: {
            $set: action.suggestions
              .filter( excludeEventsWithUids.bind( null, state.events.map( e => e.uid ) ) )
              .map( formatEventItem.bind( null, state.lang ) )
          }
        },
        loadingSuggestions: { $set: false }
      } );

      break;

    case 'SUGGESTION_REQUEST_ADD_SUCCESS':

      return update( state, {
        search: {
          searching: { $set: false },
          error: { $set: null },
          events: { $set: null },
          suggestions: { $set: [] }
        },
        events: {
          $set: state.events.concat( action.suggestions
            .filter( excludeEventsWithUids.bind( null, state.events.map( e => e.uid ) ) )
            .filter( ( e, i ) => i < 3 ) // keep three items
            .map( formatEventItem.bind( null, state.lang ) ) )
        },
        loadingSuggestions: { $set: false }
      } );

      break;

    case 'SUGGESTION_RESET':

      if ( _.isEqual( state.sample, action.sample ) ) {

        return state;

      }

      return update( state, {
        search: {
          suggestions: { $set: null }
        },
        sample: {
          $set: action.sample
        }
      } );

    default:

      return state;

  }

}
