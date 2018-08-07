"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';

import { push } from 'react-router-redux';

import isMemberValid from '../lib/isMemberValid';

module.exports = _.extend( reducer, {
  evaluate
} );


function reducer( state = {}, action = {} ) {

  return state;

}


/**
 * define which screen should be shown
 */
function evaluate() {

  return ( dispatch, getState ) => {

    const state = getState();

    const {
      base,
      member: memberConfig
    } = state.config;

    if ( memberConfig.dataIsRequired && !isMemberValid( state.member ) ) {

      return dispatch( push( base + '/member' ) );

    }

    return dispatch( push( base + '/event' ) );

  }

}