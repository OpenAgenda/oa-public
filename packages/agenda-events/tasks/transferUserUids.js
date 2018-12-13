"use strict";

const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const list = require( '../service/list' );
const update = require( '../service/update' );
const logs = require( '@openagenda/logs' )( 'tasks/transferUserUids' );

let config;

module.exports = _.extend( run, {
  init: c => config = c
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

          let result = await update( ref.agendaUid, ref.eventUid, { userUid }, { protected: false } );

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
