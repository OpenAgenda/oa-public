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
function evaluate( step ) {

  return ( dispatch, getState ) => {

    const state = getState();

    const {
      base,
      member: memberConfig
    } = state.config;

    const authorizedSteps = [ 'member' ];

    if ( !memberConfig.dataIsRequired || isMemberValid( state.member ) ) {

      authorizedSteps.push( 'event' );

    }

    if ( _.get( state, 'event.uid' ) ) {

      authorizedSteps.push( 'confirmation' );

    }

    if ( !step || !authorizedSteps.includes( step ) ) {

      dispatch( push( base + '/' + authorizedSteps.pop() ) );

    }

  }

}
