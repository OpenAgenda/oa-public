"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

const isMemberValid = require( './isMemberValid' );

const codes = [ 'member', 'event', 'confirmation' ];

module.exports = ( current, state ) => {

  const { member: memberConfig } = state.config;

  const { member } = state;

  const steps = codes
    .reduce( ( steps, step ) => _.set( steps, step, {
      display: true,
      active: false,
      activable: false,
      validated: false
    } ), {} );

  steps[ current ].active = true;

  if ( !memberConfig.dataIsRequired ) {

    steps.member.display = false;

  }

  const isAdministrator = _.get( member, 'role' ) === 'administrator';

  if ( (
    memberConfig.dataIsRequired &&
    current !== 'member' &&
    isMemberValid( member )
  ) || isAdministrator ) {

    steps.member.validated = true;

  }

  if ( memberConfig.dataIsRequired && current === 'event' ) {

    steps.member.activable = true;

  }

  if ( current === 'member' && ( isMemberValid( member ) || isAdministrator ) ) {

    steps.event.activable = true;

  }

  return ih( state, {
    steps: {
      $set: codes.map( step => _.assign( { step }, steps[ step ] ) )
    }
  } );

}
