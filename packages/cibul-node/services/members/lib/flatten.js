"use strict";

const _ = require( 'lodash' );

const labels = Object.assign( {},
  require( '@openagenda/labels/members' ),
  require( '@openagenda/labels/contributors/exportHeaders' )
);
const flatten = require( '@openagenda/labels/flatten' );
const roles = require( '@openagenda/members/lib/roles' );

const roleLabelKey = role => _.first( _.keys( roles ).filter( code => roles[ code ] === role ) ).toLowerCase();

module.exports = lang => {

  const flatLabels = flatten( labels, lang );

  return m => _.mapKeys( {
    name: _.get( m, 'custom.contactName', _.get( m, 'user.fullName' ) ),
    state: _.get( m, 'invited' ) ? flatLabels.invited : ( m.deletedUser ? flatLabels.deletedUser : flatLabels.hasAccount ),
    role: flatLabels[ roleLabelKey( m.role ) ],
    email: _.get( m, 'custom.email' ),
    organization: _.get( m, 'custom.organization' ),
    phone: _.get( m, 'custom.contactName' ),
    position: _.get( m, 'custom.contactPosition' ),
    contributions: _.get( m, 'eventCount' ),
  }, ( v, k ) => flatLabels[ k ] );

}
