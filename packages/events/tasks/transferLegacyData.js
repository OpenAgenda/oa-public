"use strict";

const utils = require( 'utils' );
const mysql = require( 'mysql' );
const async = require( 'async' );
const logger = require( 'basic-logger' );
const _ = require( 'lodash' );

let service, config, log;

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
    removeFailIds: [],
    failIds: []
  }, limit = 20, offset = 0;

  async.whilst( () => !trasversed, wcb => {

    con.query( `select id from ${config.legacy.schemas.event} limit ${offset}, ${limit}`, ( err, rows ) => {

      trasversed = !rows.length;

      offset += limit;

      async.eachSeries( rows, ( row, ecb ) => {

        log( 'info', 'transferring event %s', row.id );

        service.legacy.transfer( row.id, ( err, r ) => {

          if ( err ) {

            log( 'error', 'transferring event error: %s, error: %s', row.id, err );

            result.fails++;
            result.failIds.push( row.id );

          } else if ( r.success && r.transfered ) {

            log( 'info', 'transferring event success: %s, %s', row.id, r.created ? 'created' : 'updated' );

            result.successes++;
            result.transfered++;

          } else if ( r.success ) {

            log( 'info', 'transferring event not required: %s', row.id );

            result.successes++;

          } else if ( !r.valid ) {

            log( 'error', 'transferring event not successful: %s event invalid with %s errors', row.id, r.errors.length );

            r.errors.forEach( e => {

              log( 'error', 'error %s: %s', row.id, Object.keys( e ).map( k => {

                return k + ': ' + e[ k ];

              } ).join( '|' ) );

            } );

            result.fails++;
            result.failIds.push( row.id );

          } else {

            log( 'error', 'transferring event not successful: %s unknown reason', row.id );

            result.fails++;
            result.failIds.push( row.id );

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
                result.removeFailIds.push( row.id );

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

  log = logger( 'events service/tasks/transferLegacyData' );

}