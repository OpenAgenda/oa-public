"use strict";

var coms = require( '../../lib/coms' ),

config = require( '../../config' ),

logger = require( 'logger' ), log,

svc, eventSvc = require( '../event' ),

w = require( 'when' ),

async = require( 'async' );

module.exports = function( s ) {

  log = logger( 'services/agenda/tags' );

  svc = s;

  return {
    agendaTagsChanged
  }

}

function agendaTagsChanged( agendaId, changes, cb ) {

  w( {
    agendaId: agendaId,
    changes: changes,
    tagSlugs: [],
    agenda: false,
  } )

  .then( _loadAgenda )

  .then( _concatTagSlugs )

  .then( _streamedRefresh )

  .then( _refreshAgenda )

  .done( v => { cb ? cb() : null }, err => {

    log( 'error', err );

    if ( cb ) cb( err );

  } );

}


function _concatTagSlugs( v ) {

  [ 'removed', 'updated' ].forEach( op => {

    if ( v.changes[ op ] ) {

      v.tagSlugs = v.tagSlugs.concat( v.changes[ op ].map( t => t[ op == 'updated' ? 'previousSlug' : 'slug' ] ) );

    }

  } );

  log( 'agenda %s tag slugs to process "%s"', v.agendaId, v.tagSlugs.join( ', ' ) );

  return v;

}


function _streamedRefresh( v ) {

  log( 'stream refresh of events of agenda %s', v.agendaId );

  var d = w.defer();

  async.eachSeries( v.tagSlugs, ( slug, ecb ) => {

    let stream = v.agenda.searchStream( {
      passed: 1,
      showAll: true,
      tags: slug
    } );

    stream.on( 'data', event => {

      coms.publish( config.mainChannel, {
        name: 'event.update',
        values: {
          id: event.id,
          agendaId: v.agenda.id,
          type: 'event.tagUpdate'
        }
      } );

    } );

    stream.on( 'end', ecb );

  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}

function _refreshAgenda( v ) {

  log( 'refreshing agenda %s', v.agendaId );

  var d = w.defer();

  v.agenda.refresh( err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}

function _loadAgenda( v ) {

  log( 'loading agenda %s', v.agendaId );

  var d = w.defer();

  svc.get( { id: v.agendaId }, ( err, agenda ) => {

    if ( err ) return d.reject( err );

    v.agenda = agenda;

    d.resolve( v );

  } );

  return d.promise;

}