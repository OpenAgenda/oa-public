"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';

import { push } from 'react-router-redux';

const CREATE = 'agenda-contribute/event/CREATE';
const UPDATE = 'agenda-contribute/event/UPDATE';

module.exports = _.extend( reducer, {
  created,
  updated
} );


function reducer( state = {}, action = {} ) {

  switch ( action.type ) {

    case CREATE:

      return action.event;

    case UPDATE:

      return action.event;

  }

  return state;

}


function updated( values, response ) {


}


/**
 * member data save was confirmed by server
 */

function created( values, response ) {

  return ( dispatch, getState ) => {

    const state = getState();

    const { base } = state.config;

    dispatch( {
      type: CREATE, 
      event: _.get( response, 'body.event' )
    } );

    return dispatch( push( base + '/confirmation' ) );

  }

}
