"use strict";

const config = require( './config' );
const h = require( './helpers' );
const w = require( 'when' );
const _ = require( 'lodash' );
const VError = require( 'verror' );
const preParse = require( './index/preParse' );
const clean = require( './helpers/clean' );

module.exports = add;


function add( alias, event, options, cb ) {

  if ( arguments.length === 3 ) {

    cb = options;
    options = {};

  }

  w( {
    in: {
      alias,
      event,
      params:  _.extend( {
        refresh: false
      }, options )
    },
    client: config.client,
    interfaces: config.interfaces,
    location: null,
    clean: null,
    out: {
      success: null
    }
  } )

  .then( _loadLocation )

  .then( _clean )

  .then( _index )

  .done( v => {

    cb( null, v.out );

  }, cb );

}


function _clean( v ) {

  v.clean = clean( _.extend( {}, v.in.event, { location: v.location } ) );

  return v;

}


function _loadLocation( v ) {

  let d = w.defer();

  v.interfaces.locationsList( { uids: [ v.in.event.locationUid ] }, 0, 1, ( err, locations ) => {

    if ( err ) return d.reject( err );

    if ( !locations.length ) {

      return d.reject( new VError( err, 'create: location %s not found for event %s', v.in.event.locationUid, v.in.event.uid ) );

    }

    v.location = locations[ 0 ];

    d.resolve( v );

  } );

  return d.promise;

}

function _index( v ) {

  let d = w.defer();

  // index as is
  v.client.index({
    index: v.in.alias,
    refresh: v.in.params.refresh,
    type: 'event',
    id: v.clean.uid,
    body: preParse( v.clean )
  }, ( err, result ) => {

    if ( err ) {

      return d.reject( new VError( 'failed to add event to index', err ) );

    }

    if ( result.created ) {

      v.out.success = true;

    }

    d.resolve( v );

  } );

  return d.promise;

}