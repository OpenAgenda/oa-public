"use strict";

const _ = require( 'lodash' );
const utils = require( 'utils' );
const w = require( 'when' );
const config = require( '../config' );
const _get = require( './lib/get' );

module.exports = function get( query, options, cb ) {

  if ( arguments.length == 2 ) {
    cb = options;
    options = {};
  }

  if ( typeof query === 'number' ) query = { id: query };

  const params = Object.assign( {
    fullImagePath: false,
    detailed: false,
    removed: false
  }, options );

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: _.pick( query, [ 'id', 'uid', 'key', 'email' ] ),
    user: null,
    params
  } )

    .then( _get )

    .then( _clean )

    .then( _formatImageUrl )

    .done( v => cb( null, v.user ), err => cb( err ) );

};

function _formatImageUrl( v ) {

  const image = v.user && v.user.image;

  if ( v.params.fullImagePath && image ) {

    if ( !image.match( /(?:https?:|\/\/)(.*)/ ) ) {
      v.user.image = '//' + config.files.bucket + '.s3.amazonaws.com/' + image;
    }

  }

  return v;

}

function _clean( v ) {

  if ( v.user ) {

    v.user = utils.filterByAttr( v.user, [
      'id', 'uid', 'full_name', 'username', 'email', 'image', 'facebook_uid',
      'twitter_id', 'google_id', 'culture', 'is_activated', 'created_at', 'updated_at', 'last_notified', 'is_removed',
      'is_new', 'last_signin', 'comexposium_id', 'api_key', 'api_secret'
    ]
      .concat( v.params && v.params.store ? 'store' : [] ) );

    if ( v.params && v.params.store && v.user && v.user.store ) {

      v.user.store = JSON.parse( v.user.store || '{}' );

    }

  }

  return v;

}
