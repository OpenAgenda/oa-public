"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const config = require( '../config' );
const _get = require( './lib/get' );
const set = require( './set' );

module.exports = function setNewFlag( query, flag, options, cb ) {

  if ( !config ) return cb( 'service not initialized' );

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

    .then( _get )

    .then( v => new Promise( ( resolve, reject ) => {

      const exceptedFlag = flag ? 1 : 0;

      if ( !v.user || v.user.is_new === exceptedFlag ) return resolve( v );

      set(
        Object.assign( {}, v.query, { is_new: exceptedFlag } ),
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
