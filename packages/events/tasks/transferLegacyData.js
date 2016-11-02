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
    total: false,
    offset: 0
  } );

  let con = mysql.createConnection( config.legacy.mysql ),

  trasversed, result = {
    successes: 0,
    fails: 0,
    failUids: []
  }, limit = 20, offset = taskParams.offset;

  async.whilst( () => !trasversed, wcb => {

    con.query( `select id from ${config.legacy.schemas.event} limit ${offset}, ${limit}`, ( err, rows ) => {

      trasversed = !rows.length;

      if ( !trasversed && taskParams.total ) {

        trasversed = offset + limit >= taskParams.total;

      }

      offset += limit;

      async.eachSeries( rows, ( row, ecb ) => {

        service.legacy.transfer( row.id, ( err, r ) => {

          if ( err ) return cb( err );

          if ( r.transfered ) {

            result.successes++;

          } else {

            result.fails++;
            result.failUids.push( r.entries.event.uid );

          }

          ecb();

        } );

      }, wcb );

    } );

  }, err => {

    con.end();

    cb( err, result );

  } );

}

function init( svc, c ) {

  service = svc;

  config = c;

}