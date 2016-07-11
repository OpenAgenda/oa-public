"use strict";

import update from 'react-addons-update'

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
          events: { $set: 
            action.events
            .filter( e => state.events.map( ev => ev.uid ).indexOf( e.uid ) === -1 )
            .map( e => ( { 
              uid: e.uid,
              title: e.title[ state.lang ],
              dateRange: e.dateRange[ state.lang ],
              location: {
                name: e.location.name,
                address: e.location.address
              }
            } ) ) 
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