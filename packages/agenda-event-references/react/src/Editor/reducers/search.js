"use strict";

import update from 'react-addons-update'

export default ( state = {}, action ) => {
  
  switch ( action.type ) {

    case 'SEARCH_REQUEST':

      return update( state, {
        searching: { $set: true },
        query: { $set: action.query }
      } );

    case 'SEARCH_FAILED':

      return update( state, {
        searching: { $set: false },
        error: { $set: action.error }
      } );

    case 'SEARCH_SUCCESS':

      return update( state, {
        searching: { $set: false },
        query: { $set: action.query },
        events: { $set: action.events }
      } );

    case 'SEARCH_SHOW':

      return {
        display: true
      };

    case 'SEARCH_HIDE':

      return {
        display: false
      };

    default:

      return state;
      
  }

}