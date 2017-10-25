"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const config = require( '../config' );
const set = require( './set' );

module.exports = function refreshLastSignin( query, options, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  if ( arguments.length === 2 ) {
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

      set(
        Object.assign( {}, v.query, { last_signin: new Date() } ),
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
