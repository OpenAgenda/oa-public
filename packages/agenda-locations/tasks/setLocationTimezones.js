"use strict";

/**
 * fetch timezones for locations where they are missing;
 *
 * loops on locations without tz set in store, gets timezone through
 * geocode service, and updates all locations in same geographical
 * segment
 *
 * tested in test/setLocationTimezones.task.js
 */


const log = require( '@openagenda/logs' )( 'setLocationTimezones' );

var db = require( '../lib/db' ),

async = require( 'async' ),

gf = require( '@openagenda/geocode-farm' ),

utils = require( '@openagenda/utils' );

module.exports = function( cb ) {

  if ( !db.isReady() ) {

    return cb( 'search or db not ready' );

  }


  // loop through locations where timezone is not set
  _loopUnsetTimezone( ( lEntry, con, lcb ) => {

    log( 'processing locations like %s of address %s', lEntry.uid, lEntry.address );

    _fetchTimezone( lEntry, ( err, tz ) => {

      let updateSegment = _defineLocationSegment( lEntry ),

      segmentCount = 0,

      timezone;

      if ( err ) {

        log( 'error', 'failed to retrieve geocode for location %s: %s', lEntry.uid, err );

        return cb( err );

      }

      timezone = tz;

      log( 'info', 'will set timezone %s on segment %s', timezone, JSON.stringify( updateSegment ) );


      // update all locations without specified timezone in same region or department or city.
      _loopThroughSegment( con, updateSegment, ( slEntry, scb ) => {

        let store;

        try {

          store = JSON.parse( slEntry.store || '{}' );

          if ( utils.isArray( store ) && !store.length ) {

            store = {};

          }

          if ( store === null ) {

            store = {};

          }

        } catch( e ) {

          log( 'error', 'could not parse store of location %s: %s', slEntry.uid, slEntry.store );

          store = {};

        }

        store.timezone = timezone;

        con.query( 'update location set store = ? where id = ?', [ JSON.stringify( store ), slEntry.id ], err => {

          if ( err ) {

            log( 'error', 'failed to update location %s: %s', lEntry.uid, err );

            return scb( err );

          }

          segmentCount++;

          log( 'updated %s - %s with timezone %s', slEntry.uid, slEntry.address, timezone );

          scb();

        } );

      }, err => {

        log( 'info', '========== set timezone %s for %s locations ==========', timezone, segmentCount );

        lcb( err );

      } );

    } );

  }, err => {

    log( 'loop is done and over' );

    cb( err );

  } );

}

module.exports.init = function( config, cb ) {

  gf.init( config.geocodefarm );

  db.init( config.mysql, {}, cb );

}


function _loopThroughSegment( con, updateSegment, lcb, cb ) {

  let query = [ 'select * from location where' ],

  wheres = [], whereValues = [], hasMore = true;

  Object.keys( updateSegment ).forEach( s => {

    if ( updateSegment[ s ] === null ) {

      wheres.push( s + ' is null' );

    } else {

      wheres.push( s + ' = ?' );

      whereValues.push( updateSegment[ s ] );

    }


  } );

  query.push( wheres.join( ' and ' ) );

  query.push( 'and store not like ?' );

  whereValues.push( '%"timezone"%' );

  query.push( 'limit 0, 1' );

  query = query.join( ' ' );

  log( 'loop through segment query: %s', query );

  async.doWhilst( wcb => {

    con.query( query, whereValues, ( err, rows ) => {

      if ( err ) return cb( err );

      if ( !rows.length ) {

        hasMore = false;

        return wcb();

      }

      lcb( rows[ 0 ], wcb );

    } );

  }, () => hasMore, cb );

}


function _loopUnsetTimezone( lcb, cb ) {

  let hasMore = true;

  async.doWhilst( wcb => {

    let con = db.getConnection();

    con.query( 'select * from location where store not like ? limit 0, 1', '%"timezone"%', ( err, rows ) => {

      if ( err ) return cb( err );

      if ( !rows.length ) {

        con.end();

        hasMore = false;

        wcb();

      } else {

        lcb( rows[ 0 ], con, err => {

          con.end();

          wcb( err );

        } );

      }

    } );

  }, () => hasMore, cb );

}


function _defineLocationSegment( lEntry ) {

  let updateSegment = { country: lEntry.country };

  [ 'region', 'department', 'city', 'placename', 'uid' ].forEach( segment => {

    if ( utils.size( updateSegment ) > 1 ) {

      return;

    }

    if ( lEntry[ segment ] && lEntry[ segment ].length ) {

      updateSegment[ segment ] = lEntry[ segment ];

    }

  } );

  return updateSegment;

}


function _fetchTimezone( lEntry, cb ) {

  log( '******* doing geocode for %s in %s *******', lEntry.address, lEntry.city );

  // fetch geocode info for location
  gf( {
    address: lEntry.address,
    countryCode: lEntry.country
  }, ( err, result ) => {

    if ( err ) {

      return cb( err );

    }

    if ( result.length ) {

      return cb( null, result[ 0 ].timezone );

    }

    gf( {
      address: lEntry.city,
      countryCode: lEntry.country
    }, ( err, result ) => {

      if ( err ) return cb( err );

      if ( result.length ) {

        return cb( null, result[ 0 ].timezone );

      }

      return cb( null, null );

    } );

  } );

}
