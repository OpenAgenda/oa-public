"use strict";

const _ = require( 'lodash' );

const w = require( 'when' );

const async = require( 'async' );

const mysql = require( 'mysql' );

module.exports = _.extend( run, {
  init: ( c, k, s ) => { config = c; svc = s; }
} );

let config, svc;

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
    report: {
      creates: 0,
      updates: 0,
      removes: 0,
      errors: 0
    }
  } )

  .then( _setReferences )

  .then( _removeReferences )

  .done( v => {

    cb( null, v.report );

  }, err => {

    con.end();

    cb( err );

  } );

}

function _setReferences( v ) {

  let trasversed = false, offset = 0, limit = 20;

  let d = w.defer();

  async.whilst( () => !trasversed, wcb => {

    v.con.query( `select review_id, event_id, is_published, state, featured, updated_at from ${v.config.legacy.schemas.agendaEvent} limit ?, ?`, [ offset, limit ], ( err, rows ) => {

      if ( err ) return wcb( err );

      if ( !rows.length ) {

        trasversed = true;

        return wcb();

      }

      offset += limit;

      async.eachSeries( rows, ( row, ecb ) => {

        if ( trasversed ) {

          return ecb();

        }

        _set( v, row, err => {

          if ( v.remaining !== null && --v.remaining === 0 ) {

            trasversed = true;

          }

          ecb( err ); 

        } );

      }, wcb );

    } );

  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}

function _set( { con, report }, row, cb ) {

  svc( row.review_id ).set( row.event_id, {
    featured: row.featured,
    state: _getLegacyState( row )
  }, ( err, result ) => {

    if ( err ) {

      console.log( 'agenda/event ref %s errored: %s', row.review_id + '/' + row.event_id, err );

      report.errors++;

    } else if ( result.created ) {

      console.log( 'agenda/event ref %s created', row.review_id + '/' + row.event_id );

      report.creates++;

    } else if ( result.updated ) {

      console.log( 'agenda/event ref %s updated', row.review_id + '/' + row.event_id );

      report.updates++;

    } else {

      console.log( 'agenda/event ref %s errored: %s', row.review_id + '/' + row.event_id, JSON.stringify( result ) );

      report.errors++;

    }

    cb();

  } );

}

function _getLegacyState( row ) {

  if ( row.state === null ) {

    return row.is_published ? svc.states.PUBLISHED : svc.states.TOCONTROL;

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

    v.con.query( `select agenda_id, event_id from ${config.schemas.agendaEvent} limit ?, ?`, [ offset, limit ], ( err, rows ) => {

      if ( err ) return wcb( err );

      let refs = rows.map( r => ( { agendaId: r.agenda_id, eventId: r.event_id } ) );

      if ( !rows.length ) {

        trasversed = true;

        return wcb();

      }

      offset += limit;

      async.eachSeries( refs, ( r, ecb ) => {

        v.con.query( `select id from ${config.legacy.schemas.agendaEvent} where review_id = ? and event_id = ?`, [ r.agendaId, r.eventId ], ( err, rows ) => {

          if ( err ) return ecb( err );

          if ( rows.length ) return ecb();

          svc( r.agendaId ).remove( r.eventId, err => {

            if ( err ) return ecb( err );

            console.log( 'agenda/event ref %s removed', r.agendaId + '/' + r.eventId );

            v.report.removes++;

            ecb();

          } );

        } );

      }, wcb );

    } );

  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

} 