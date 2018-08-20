"use strict";

const _ = require( 'lodash' );

const map = [ {
  stakeholder: 'contactName',
  member: 'name'
}, {
  stakeholder: 'contactPosition',
  member: 'position'
}, {
  stakeholder: 'organization',
  member: 'organisation'
}, {
  stakeholder: 'contactNumber',
  member: 'phone'
}, {
  stakeholder: 'email',
  member: 'email'
} ];

module.exports.toMember = st => {

  return map.reduce( ( carry, corr ) => {

    carry[ corr.member ] = _.get( st, corr.stakeholder );

    if ( corr.stakeholder === 'organization' && _.isObject( carry[ corr.member ] ) ) {

      carry[ corr.member ] = _.get( carry[ corr.member ], 'label' );

    }

    return carry;

  }, {} );

}

module.exports.toStakeholder = m => {

  return map.reduce( ( carry, corr ) => {

    carry[ corr.stakeholder ] = _.get( m, corr.member );

    return carry;

  }, {} );

}
