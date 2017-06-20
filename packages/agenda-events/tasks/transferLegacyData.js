"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const logger = require( 'basic-logger' );

const async = require( 'async' );

const mysql = require( 'mysql' );

module.exports = _.extend( run, {
  init: ( c, k, s ) => {

    config = c; 
    svc = s;
    log = logger( 'agenda-events/tasks/transferLegacyData' );

  }
} );

let config, svc, log;

function run( options, cb ) {

  if ( arguments.length === 1 ) {

    cb = options;

    options = {}

  }

  const taskParams = _.defaults( options, {
    total: null
  } );

  let con = mysql.createConnection( config.mysql );

  w( {
    con,
    config,
    remaining: taskParams.total,
    offset: 0,
    limit: 100,
    report: {
      creates: 0,
      updates: 0,
      removes: 0,
      errors: 0
    }
  } )

  .then( _reachReferences )

  .then( _setReferences )

  .then( _removeReferences )

  .done( v => {

    con.end();

    cb( null, v.report );

  }, err => {

    con.end();

    cb( err );

  } );

}

function _reachReferences( v ) {

  let found = false;

  let d = w.defer();

  async.whilst( () => !found, wcb => {

    v.con.query( `select review_id, event_id from ${v.config.legacy.schemas.agendaEvent} limit ?, ?`, [ v.offset, v.limit ], ( err, rows ) => {

      if ( err ) return wcb( err );

      v.con.query( `select legacy_id from ${v.config.schemas.agendaEvent} where legacy_id in ('${rows.map( r => r.review_id + '.' + r.event_id ).join( '\', \'' )}')`, ( err, newRows ) => {

        if ( err ) return wcb( err );

        if ( !rows.length || ( rows.length !== newRows.length ) ) {

          found = true;

        } else {

          v.offset += v.limit;

          log( 'info', 'jumping %s rows to %s', v.limit, v.offset );

        }

        wcb();

      } );

    } );

  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}

function _setReferences( v ) {

  let trasversed = false, offset = 0, limit = 20;

  let d = w.defer();

  async.whilst( () => !trasversed, wcb => {

    v.con.query( `select a.id as agendaId, e.id as eventId, a.uid as agendaUid, e.uid as eventUid, ra.is_published, ra.state, ra.featured, ra.updated_at as updatedAt, ra.created_at as createdAt, u.uid as userUid
     from ${v.config.legacy.schemas.agendaEvent} as ra 
     left join ${v.config.legacy.schemas.agenda} as a on a.id=ra.review_id
     left join ${v.config.legacy.schemas.event} as e on e.id=ra.event_id
     left join ${v.config.legacy.schemas.user} as u on u.id=ra.user_id
     limit ?, ?`, [ v.offset, v.limit ], ( err, rows ) => {

      if ( v.offset % 100 === 0 ) {

        log( 'info', 'evaluated %s agenda event references', offset );

      }

      if ( err ) return wcb( err );

      if ( !rows.length ) {

        trasversed = true;

        return wcb();

      }

      v.offset += v.limit;

      async.eachSeries( rows, ( row, ecb ) => {

        if ( trasversed ) {

          return ecb();

        }

        _set( v, row ).then( () => {

          if ( v.remaining !== null && --v.remaining === 0 ) {

            trasversed = true;

          }

          ecb();

        } )

        .catch( ecb );

      }, wcb );

    } );

  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}

function _set( { con, report }, row ) {

  let operation = null;

  return svc( row.agendaUid ).get( row.eventUid ).then( ref => {

    if ( ref === null ) {

      operation = 'create';

      return svc( row.agendaUid ).create( row.eventUid, {
        featured: row.featured,
        state: _getLegacyState( row ),
        legacyId: row.agendaId + '.' + row.eventId,
        userUid: row.userUid,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }, { protected: false } ).then( result => {

        return _sleep( config.legacy.interval ).then( () => result );

      } );

    } else if ( ref.updatedAt.getTime() === row.updatedAt.getTime() ) {

      operation = 'ignored.sameUpdatedAt';

    } else {

      operation = 'update';

      return svc( row.agendaUid ).update( row.eventUid, {
        featured: row.featured,
        state: _getLegacyState( row ),
        legacyId: row.agendaId + '.' + row.eventId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }, { protected: false } ).then( result => {

        return _sleep( config.legacy.interval ).then( () => result );

      } );

    }

  } )

  .then( result => {

    if ( operation === 'create' ) {

      log( 'agenda/event ref %s created', row.agendaUid + '/' + row.eventUid );

      report.creates++;

    } else if ( operation === 'update' ) {

      log( 'agenda/event ref %s updated', row.agendaUid + '/' + row.eventUid );

      report.updates++;

    } else if ( operation === 'ignored.sameUpdatedAt' ) {

      log( 'agenda/event ref %s ignored: same updatedAt', row.agendaUid + '/' + row.eventUid );

    } else {

      log( 'agenda/event ref %s errored: %s', row.agendaUid + '/' + row.eventUid, JSON.stringify( result ) );

      report.errors++;

    }

  } )

  .catch( err => {

    log( 'agenda/event ref %s errored: %s', row.agendaUid + '/' + row.eventUid, err );

    report.errors++;

  } );

}

function _getLegacyState( row ) {

  if ( row.is_published ) {

    return svc.states.PUBLISHED;

  }

  return row.state;

}


/**
 * remove references that are not found in legacy data:
 * trasverses data, queries legacy by pair ids.
 * Bit slower than just using main id as reference, not a big deal
 * as this will not be run many times before deprecation
 */
function _removeReferences( v ) {

  let trasversed = false, offset = 0, limit = 20;

  let d = w.defer();

  async.whilst( () => !trasversed, wcb => {

    v.con.query( `select agenda_uid, event_uid from ${config.schemas.agendaEvent} limit ?, ?`, [ offset, limit ], ( err, rows ) => {

      if ( err ) return wcb( err );

      let refs = rows.map( r => ( { agendaUid: r.agenda_uid, eventUid: r.event_uid } ) );

      if ( !rows.length ) {

        trasversed = true;

        return wcb();

      }

      offset += limit;

      async.eachSeries( refs, ( r, ecb ) => {

        v.con.query( `select ae.id from ${config.legacy.schemas.agendaEvent} as ae
          left join ${config.legacy.schemas.event} as e on e.id=ae.event_id
          left join ${config.legacy.schemas.agenda} as a on a.id=ae.review_id 
          where a.uid = ? and e.uid = ?`, [ r.agendaUid, r.eventUid ], ( err, rows ) => {

          if ( err ) return ecb( err );

          if ( rows.length ) return ecb();

          svc( r.agendaUid ).remove( r.eventUid ).then( result => {

            log( 'agenda/event ref %s removed', r.agendaUid + '/' + r.eventUid );

            v.report.removes++;

            ecb();

          } ).catch( ecb );

        } );

      }, wcb );

    } );

  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

} 


function _sleep( ms ) {

  return new Promise( rs => {

    log( 'sleeping %s ms', ms );

    setTimeout( () => { rs() }, ms );

  } );

}