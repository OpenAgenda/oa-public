"use strict";

import get from '@openagenda/utils/get';

const _ = {
  isArray: require( 'lodash/isArray' )
};

export default {

  suggest,

  suggestionsAdd,

  resetSuggestions

}

function getSuggestions( res, reference, excludedEvents, cb ) {

  get( res, {
    sample: reference,
    exclude: excludedEvents.map( e => e.uid )
  }, cb );

}

function suggestionsAdd() {

  return ( dispatch, getState ) => {

    const {
      uid,
      res,
      sample,
      events,
      search
    } = getState();

    if ( !sample ) return;

    if ( search.suggestions && !search.suggestions.length ) return;

    dispatch( { type: 'SUGGESTION_REQUEST' } );

    getSuggestions( res.suggestions, sample, events.concat( uid ? [ { uid } ] : [] ), ( error, suggestions ) => {

      if ( error ) {

        return dispatch( { type: 'SUGGESTION_REQUEST_FAILED', error } );

      }

      dispatch( { type: 'SUGGESTION_REQUEST_ADD_SUCCESS', suggestions } );

    } );

  }

}

function resetSuggestions( newSuggestFrom ) {

  return {
    type: 'SUGGESTION_RESET',
    sample: newSuggestFrom
  }

}

function suggest() {

  return ( dispatch, getState ) => {

    const {
      res,
      sample,
      events,
      search
    } = getState();

    if ( !sample ) return;

    if ( search.suggestions && !search.suggestions.length ) return;

    dispatch( { type: 'SUGGESTION_REQUEST' } );

    getSuggestions( res.suggestions, sample, events, ( error, suggestions ) => {

      if ( error ) {

        return dispatch( { type: 'SUGGESTION_REQUEST_FAILED', error } );

      }

      dispatch( { type: 'SUGGESTION_REQUEST_SUCCESS', suggestions: _.isArray( suggestions ) ? suggestions : [] } );

    } );

  }

}
