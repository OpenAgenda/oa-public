"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';

import { push } from 'react-router-redux';

const UPDATE = 'agenda-contribute/member/UPDATE';

module.exports = _.extend( reducer, {
  updated
} );


function reducer( state = {}, action = {} ) {

  switch ( action.type ) {

    case UPDATE:

      return ih( state, {
        member: { values: { $set: action.member } }
      } );

  }

  return state;

}


/**
 * member data update was confirmed by server
 */

function updated( member ) {

  return ( dispatch, getState ) => {

    const state = getState();

    const { base } = state.config;

    dispatch( { type: UPDATE, member } );

    return dispatch( push( base + '/event' ) );

  }

}