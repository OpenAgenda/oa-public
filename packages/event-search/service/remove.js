"use strict";

const config = require( './config' );
const w = require( 'when' );
const _ = require( 'lodash' );
const VError = require( 'verror' );

module.exports = remove;

function remove( alias, identifiers, options, cb ) {

  if ( arguments.length === 3 ) {

    cb = options;
    options = {};

  }

  w( {
    in: {
      alias,
      params: _.extend( {
        refresh: false
      }, options )
    },
    uid: identifiers.uid, // nothing else for now
    client: config.client,
    type: config.type,
    out: {
      success: null
    }
  } )

  .then( _remove )

  .done( v => {

    cb( null, v.out );

  }, cb );

}


function _remove( v ) {

  let d = w.defer();

  v.client.delete( {
    index: v.in.alias,
    type: v.type,
    id: v.uid,
    refresh: v.in.params.refresh
  }, ( err, res ) => {

    if ( err ) return d.reject( new VError( err, 'could not remove event %s from index of alias %s', v.uid, v.in.alias ) );

    v.out.success = res.result === 'deleted';

    v.out.response = res;

    d.resolve( v );

  } );

  return d.promise;

}

