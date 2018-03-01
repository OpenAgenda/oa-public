"use strict";

const _ = require( 'lodash' );
const utils = require( '@openagenda/utils' );

module.exports = function cleanGet( v ) {

  if ( v.user ) {

    v.user = utils.filterByAttr( v.user, [
      'id', 'uid', 'full_name', 'username', 'email', 'image', 'facebook_uid',
      'twitter_id', 'google_id', 'culture', 'is_activated', 'created_at', 
      'updated_at', 'last_notified', 'is_removed', 'is_new', 'last_signin',
      'comexposium_id', 'api_key', 'api_secret', 'last_inbox_check'
    ]
      .concat( v.params && v.params.store ? 'store' : [] ) );

    if ( v.params && v.params.store && v.user && v.user.store ) {

      v.user.store = JSON.parse( v.user.store || '{}' );

    }

    if ( v.params && v.params.camel ) {

      v.user = _.mapKeys( v.user, ( v, k ) => _.camelCase( k ) );

    }

  }

  return v;

}
