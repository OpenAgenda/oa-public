"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const config = require( '../config' );
const set = require( './set' );

const authorized = [
  'last_signin',
  'last_inbox_check',
  'last_notified'
];

module.exports = function( field, query, options, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  const dbField = _.snakeCase( field );

  if ( !authorized.includes( dbField ) ) {

    return cb( field + ' is not refreshable' );

  }

  if ( arguments.length === 3 ) {

    cb = options;
    options = {};

  }

  w( {
    identifier: _.pick( query, [ 'id', 'uid', 'email' ] ),
    query,
    errors: [],
    success: false,
    params: options
  } )

    .then( v => new Promise( ( resolve, reject ) => {

      const part = {};

      part[ dbField ] = new Date;

      set(
        Object.assign( {}, v.query, part ),
        Object.assign( {}, v.params, { protected: false } ),
        ( err, result ) => {

          if ( err ) return reject( err );

          if ( result.success ) {

            v.user = result.user
            v.success = true;

          }

          return resolve( v );

        } );

    } ) )

    .done( v => cb( null, v.success ), err => cb( err ) );

};