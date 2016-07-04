"use strict";

import get from 'utils/get'
import clickTracker from '../../clickTracker'

export default {

  // the async search
  search,
  searchShow,
  searchHide,
  searchRequest,
  searchSuccess,
  searchFailed

}


function searchHide() {

  return {
    type: 'SEARCH_HIDE'
  }

}

function searchShow() {

  return {
    type: 'SEARCH_SHOW'
  }

}

/*function searchType( e ) {

  return function( dispatch, getState ) {

    if ( e.keyCode === 13 ) {

      let state = getState();

      return dispatch( search( state.res, state.search.query ) );

    }

    dispatch( searchChange( e.target.value ) );

  }

} */

/*function searchChange( query ) {

  return {
    type: 'SEARCH_CHANGE',
    query: query
  }

}*/

function searchRequest( query ) {

  return {
    type: 'SEARCH_REQUEST',
    query: query
  }

}

function searchSuccess( { events, query } ) {

  clickTracker.switchOff( 'search' );

  return {
    type: 'SEARCH_SUCCESS',
    events: events,
    query: query
  }

}

function searchFailed( error ) {

  clickTracker.switchOff( 'search' );

  return {
    type: 'SEARCH_FAILED',
    error: error
  }

}

function search( query ) {

  return function( dispatch, getState ) {

    let state = getState();

    dispatch( searchRequest( query ) );

    get( state.res.events, {
      search: query,
      exclude: state.events.map( e => e.uid )
    }, ( err, events ) => {

      if ( err ) {

        return dispatch( searchFailed( err ) );

      }

      dispatch( searchSuccess( { events, query } ) );

    } );

  }

}