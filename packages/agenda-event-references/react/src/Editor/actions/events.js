"use strict";

import get from '@openagenda/utils/get'

export default {
  // loads details for events defined by current references ( used at init )
  eventsLoad,
  eventsRequest,
  eventsSuccess,
  eventsFailed,
  eventAdd,
  eventRemove
}


function eventsLoad() {

  return function( dispatch, getState ) {

    let state = getState();

    dispatch( eventsRequest() );

    get( state.res.events, {
      uids: state.initUids
    }, ( err, events ) => {

      if ( err ) {

        return dispatch( eventsFailed( err ) );

      }

      dispatch( eventsSuccess( events ) );

    } );

  }

}

function eventRemove( eventUid ) {

  return {
    type: 'EVENT_REMOVE',
    eventUid: eventUid
  }

}

function eventAdd( event ) {

  return {
    type: 'EVENT_ADD',
    event: event
  }

}

function eventsRequest() {

  return {
    type: 'EVENTS_REQUEST'
  }

}

function eventsSuccess( events ) {

  return {
    type: 'EVENTS_SUCCESS',
    events: events
  }

}

function eventsFailed( error ) {

  return {
    type: 'EVENTS_FAILED',
    error: error
  }

}