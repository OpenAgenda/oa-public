"use strict";

const config = require( './config' );
const w = require( 'when' );
const _ = require( 'lodash' );
const VError = require( 'verror' );
const parseQuery = require( './query' );
const parseDoc = require( './index/preParse' );

module.exports = update;

function update( alias, identifiers, eventPart, options, cb ) {

  if ( arguments.length === 4 ) {

    cb = options;
    options = {};

  }

  w( {
    in: {
      alias,
      part: eventPart,
      params: _.extend( {
        refresh: false
      }, options )
    },
    uid: identifiers.uid, // nothing else for now.
    client: config.client,
    type: config.type,
    clean: null,
    out: {
      success: null
    }
  } )

  .then( _clean )

  .then( _update )

  .done( v => {

    cb( null, v.out );

  }, cb );

}


function _update( v ) {

  let d = w.defer();

  v.client.update( {
    index: v.in.alias,
    type: v.type,
    body: {
      doc: v.clean
    },
    id: v.uid,
    refresh: v.in.params.refresh
  }, ( err, res ) => {

    if ( err ) return d.reject( v );

    if ( res.result === 'updated' ) {

      v.out.success = true;

    }

    d.resolve( v );

  } );

  return d.promise;

}


function _clean( v ) {

  v.clean = parseDoc( v.in.part, true );

  return v;

}