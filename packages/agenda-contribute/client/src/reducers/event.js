"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';

import { push } from 'react-router-redux';

const UPDATE = 'agenda-contribute/event/UPDATE';

module.exports = _.extend( reducer, {
  updated
} );


function reducer( state = {}, action = {} ) {

  switch ( action.type ) {

    case UPDATE:

      return action.event;

  }

  return state;

}


/**
 * member data save was confirmed by server
 */

function updated( values, response ) {

  return ( dispatch, getState ) => {

    const state = getState();

    const { base } = state.config;

    dispatch( {
      type: UPDATE, 
      event: _.get( response, 'body.event' )
    } );

    return dispatch( push( base + '/confirmation' ) );

  }

}
