"use strict";

var coms = require( '../../lib/coms' ),

config = require( '../../config' ),

log = require( '@openagenda/logs' )( 'services/agenda/tagsAndCategories' ),

eventSvc = require( '../event' ),

svc,

w = require( 'when' ),

async = require( 'async' );

module.exports = function( s ) {

  svc = s;

  return {
    agendaTagsChanged: changed( 'tags' ),
    agendaCategoriesChanged: changed( 'category' )
  }

}


function changed( object ) {

  return ( agendaId, changes, cb ) => {

    log( 'processing change in %s for agenda %s', object, agendaId );

    w( {
      agendaId,
      changes,
      object: object,
      slugs: [],
      agenda: false,
    } )

    .then( _loadAgenda )

    .then( _concatSlugs )

    .then( _streamedRefresh )

    .then( _refreshAgenda )

    .done( v => { cb ? cb() : null }, err => {

      log( 'error', err );

      if ( cb ) cb( err );

    } );


  }

}


function _concatSlugs( v ) {

  [ 'removed', 'updated' ].forEach( op => {

    if ( v.changes[ op ] ) {

      v.slugs = v.slugs.concat( v.changes[ op ].map( t => t[ op == 'updated' ? 'previousSlug' : 'slug' ] ) );

    }

  } );

  log( 'agenda %s %s slugs to process "%s"', v.agendaId, v.object, v.slugs.join( ', ' ) );

  return v;

}


function _streamedRefresh( v ) {

  log( 'stream refresh of events of agenda %s', v.agendaId );

  var d = w.defer();

  async.eachSeries( v.slugs, ( slug, ecb ) => {

    let query = {
      passed: 1,
      showAll: true
    };

    query[ v.object ] = slug;

    let stream = v.agenda.searchStream( query );

    stream.on( 'data', event => {

      coms.publish( config.mainChannel, {
        name: 'event.update',
        values: {
          id: event.id,
          agendaId: v.agenda.id,
          type: v.object === 'tags' ? 'event.tagUpdate' : 'event.categoryUpdate'
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

  log( 'info', { action: 'refreshing agenda', agendaId: v.agendaId } );

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
