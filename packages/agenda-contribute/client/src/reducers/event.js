import _ from 'lodash';
import sa from 'superagent';

const CREATE = 'agenda-contribute/event/CREATE';
const UPDATE = 'agenda-contribute/event/UPDATE';

module.exports = _.extend( reducer, {
  created,
  updated,
  deleteDraft
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


function deleteDraft() {

  return ( dispatch, getState ) => {

    sa.delete( '' ).then( () => {

      window.location.href = _.get( getState(), 'config.redirects.draft' );

    } );

  }

}


function updated( values, response ) {

  return ( dispatch, getState ) => {

    const state = getState();

    const event = _.get( response, 'body.event' );

    if ( _.get( event, 'draft', false ) ) {

      window.location.href = _.get( state, 'config.redirects.draft' );

      return;

    }

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

  return ( dispatch, getState, history ) => {

    const state = getState();

    const { base } = state.config;

    const event = _.get( response, 'body.event' );

    if ( _.get( event, 'draft', false ) ) {

      window.location.href = _.get( state, 'config.redirects.draft' );

      return;

    }

    dispatch( { type: CREATE, event } );

    return history.push( base + '/confirmation' );

  }

}
