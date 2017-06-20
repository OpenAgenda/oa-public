"use strict";

const list = require( '../service/list' );

const _ = require( 'lodash' );

const logger = require( 'basic-logger' );

const mysql = require( 'mysql' );

const update = require( '../service/update' );

let config, log;

module.exports = _.extend( run, {
  init: ( c, k ) => {

    config = c; 

    log = logger( 'agenda-events/tasks/transferUserUids' );

  }
} );

async function run( options, cb ) {

  let offset = 0, limit = 20,

    con = mysql.createConnection( config.mysql ),

    refs = [],

    report = {
      updated: 0,
      errors: 0
    }

  while( ( refs = ( await list.byUserUid( null, offset, limit ) ).items ).length ) {

    let ref, userUid;

    while( ref = refs.pop() ) {

      userUid = await _fetchLegacy( con, ref );

      if ( userUid ) {

        try {

          let result = await update( ref.agendaUid, ref.eventUid, { userUid } );

          if ( result.updated ) {

            report.updated++;

          }

        } catch ( e ) {

          console.log( e );

          report.errors++;

        }

        offset--;

      }

    }

    offset += limit;

  }

  return report;

}

async function _fetchLegacy( con, ref ) {

  return new Promise( ( rs, rj ) => {

    con.query( `select u.uid as userUid
      from ${config.legacy.schemas.agendaEvent} as ra 
      left join ${config.legacy.schemas.agenda} as a on a.id=ra.review_id
      left join ${config.legacy.schemas.event} as e on e.id=ra.event_id
      left join ${config.legacy.schemas.user} as u on u.id=ra.user_id
      where a.uid = ? and e.uid = ? limit 1`, [ ref.agendaUid, ref.eventUid ], ( err, rows ) => {

      if ( err ) return rj( err );

      rs( rows.length ? rows[ 0 ].userUid : null );

    } );

  } );

}