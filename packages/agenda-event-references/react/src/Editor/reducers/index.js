"use strict";

import search from './search'
import events from './events'
import update from 'react-addons-update'

export default ( state = {}, action ) => {

  let newState = update( state, {
    search: { $set: search( state.search, action ) }
  } );

  newState = events( newState, action );

  return newState;

}