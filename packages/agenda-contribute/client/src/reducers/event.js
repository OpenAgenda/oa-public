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

  return ( dispatch, getState ) => {

    const state = getState();

    if ( _.get( state , 'config.redirects.updated' ) ) {

      window.location.href = _.get( state , 'config.redirects.updated' );

    } else {

      window.location.href = _.get( state, 'config.redirects.seeEvent' ).replace( ':eventUid', _.get( state, 'event.uid' ) );

    }

  }

}


/**
 * member data save was confirmed by server
 */

function created( values, response ) {

  return ( dispatch, getState ) => {

    const state = getState();

    const { base } = state.config;

    const event = _.get( response, 'body.event' );

    if ( _.get( event, 'draft', false ) ) {

      window.location.href = _.get( state, 'config.redirects.draft' );

      return;

    }

    dispatch( { type: CREATE, event } );

    return dispatch( push( base + '/confirmation' ) );

  }

}
