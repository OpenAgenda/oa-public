"use strict";

const utils = require( 'utils' );
const mysql = require( 'mysql' );
const async = require( 'async' );
const _ = require( 'lodash' );

let service, config;

module.exports = utils.extend( run, { init } );

function run( options, cb ) {

  if ( arguments.length === 1 ) {

    cb = options;

    options = {};

  } 

  const taskParams = _.defaults( options, {
    total: false
  } );

  let con = mysql.createConnection( config.legacy.mysql ),

  trasversed, result = {
    successes: 0,
    transfered: 0,
    fails: 0,
    removed: 0,
    removeFails: 0,
    removeFailUids: [],
    failUids: []
  }, limit = 20, offset = 0;

  async.whilst( () => !trasversed, wcb => {

    con.query( `select id from ${config.legacy.schemas.event} limit ${offset}, ${limit}`, ( err, rows ) => {

      trasversed = !rows.length;

      offset += limit;

      async.eachSeries( rows, ( row, ecb ) => {

        service.legacy.transfer( row.id, ( err, r ) => {

          if ( err ) return cb( err );

          if ( r.success ) {

            result.successes++;
            result.transfered += r.transfered ? 1 : 0;

          } else {

            result.fails++;
            result.failUids.push( r.entries.event.uid );

          }

          ecb();

        } );

      }, wcb );

    } );

  }, err => {

    if ( err ) return cb( err );

    // deal with deleted events
    
    limit = 20, offset = 0, trasversed = false;

    async.whilst( () => !trasversed, wcb => {

      con.query( `select deleted_id from ${config.legacy.schemas.deleted} where type = 'Event' limit ${offset}, ${limit}`, ( err, rows ) => {

        trasversed = !rows.length;

        offset += limit;

        async.eachSeries( rows, ( row, ecb ) => {

          service.get( row.deleted_id, { internal: true }, ( err, event ) => {

            if ( err ) return ecb( err );

            if ( event === null ) return ecb();

            service.remove( event.id, ( err, r ) => {

              if ( err ) return ecb( err );

              if ( r.success ) {

                result.removed++;

              } else {

                result.removeFails++;
                result.removeFailUids.push( event.uid );

              }

              ecb();

            } )

          } ); 

        }, wcb );

      } );

    }, err => {

      con.end();

      cb( err, result );

    } );

  } );

}

function init( svc, c ) {

  service = svc;

  config = c;

}