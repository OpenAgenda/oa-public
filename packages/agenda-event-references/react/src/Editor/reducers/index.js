"use strict";

import search from './search'
import events from './events'
import update from 'immutability-helper'

export default ( state = {}, action ) => {

  let newState = search( state, action );

  newState = events( newState, action );

  return newState;

}