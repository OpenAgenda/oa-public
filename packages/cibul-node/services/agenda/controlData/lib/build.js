"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const moment = require( 'moment-timezone' );
const phpJs = require( 'phpjs' );

const log = require( '@openagenda/logs' )( 'services/agenda/controlData' );
const utils = require( '@openagenda/utils' );

const model = require( '../../../model' );
const p = require( '../../../../lib/promises' );
const store = require( './store' );

const config = require( '../../../../config' );

let svc, eventSvc;

module.exports = function( data, cb ) {

  loadServices();

  switch( data.type ) {

    case 'eventPublish':

      return _insert( data, cb );

    case 'eventUnpublish':
    case 'eventRemove':

      return _remove( data, cb );

    case 'eventUpdate':

      return _update( data, cb );

    default:

      _reset( data, cb );

  }

}


function _update( data, cb ) {

  log( 'updating event %s in agenda %s control data', data.eventId, data.id );

  p.w( {
    useEventSlug: true,
    agendaId: data.id,
    eventId: data.eventId,
    agenda: false,
    ctlData: false,
    event: false
  } )

  .then( _loadAgenda )

  .then( _assessEventSlugRequirement )

  .then( _getControlData )

  .then( p.ifl( { ctlData: true }, _loadEvent ) )

  .then( p.ifl( { ctlData: true, event: true }, _removeEvent ) )

  .then( p.ifl( { ctlData: true }, _appendEvent ) )

  .then( p.ifl( { ctlData: true }, _updateLastOccurrence ) )

  .then( p.ifl( { ctlData: true }, _storeControlData ) )

  .done( v => {

    if ( !v.ctlData ) {

      log( 'control data not found. resetting' );

      return _reset( data, cb );

    }

    log( 'event %s was updated in agenda %s control data', v.event.id, v.agenda.id );

    cb();

  }, cb );

}


function _insert( data, cb ) {

  log( 'inserting event %s into agenda %s control data', data.eventId, data.id );

  p.w( {
    useEventSlug: true,
    agendaId: data.id,
    eventId: data.eventId,
    agenda: false,     // service instance
    ctlData: false,     // control data
    event: false
  } )

  .then( _loadAgenda )

  .then( _assessEventSlugRequirement )

  .then( _getControlData )

  .then( p.ifl( { ctlData: true }, _loadEvent ) )

  .then( p.ifl( { ctlData: true, event: true }, _appendEvent ) )

  .then( p.ifl( { ctlData: true, event: true }, _updateLastOccurrence ) )

  .then( p.ifl( { ctlData: true }, _storeControlData ) )

  .done( v => {

    if ( !v.ctlData ) {

      log( 'insert failed. resetting' );

      return _reset( data, cb );

    }

    log( 'event %s was inserted in agenda %s control data', data.eventId, data.id );

    cb();

  }, cb );

}


function _remove( data, cb ) {

  log( 'removing event %s from agenda %s control data', data.eventId, data.id );

  p.w( {
    agendaId: data.id,
    eventId: data.eventId,
    agenda: false,
    event: false,
    ctlData: false
  } )

  .then( _loadAgenda )

  .then( _getControlData )

  .then( p.ifl( { ctlData: true }, _loadEvent ) )

  .then( p.ifl( { ctlData: true, event: true }, _removeEvent ) )

  .then( p.ifl( { ctlData: true, event: true }, _updateLastOccurrence ) )

  .then( p.ifl( { ctlData: true }, _storeControlData ) )

  .done( v => {

    if ( !v.ctlData ) {

      log( 'remove failed. resetting' );

      return _reset( data, cb );

    }

    log( 'event %s was removed from agenda %s control data', data.eventId, v.agenda.id );

    cb();

  }, cb );

}


function _reset( data, cb ) {

  log( 'resetting control data of agenda %s', data.id, data );

  p.w( {
    agendaId: data.id,
    dbInstance: false, // model instance
    agenda: false,     // service instance
    ctlData: false     // control data
  } )

  .then( _loadAgenda )

  .then( _assessEventSlugRequirement )

  .then( _loadBase ) // init ctlData

  .then( _appendEvents ) // append events to ctlData

  .then( _storeControlData ) // store ctlData

  .done( function( v ) {

    log( 'info', 'control data loaded for %s', data.id );

    cb( null, v.ctlData );

  }, err => {

    log( 'error', err );

    cb( err ); // queue lib does not handle errors

  } );

}


function _updateLastOccurrence( v ) {

  return p.wn.call( v.agenda.getLastOccurrence )

  .then( lo => {

    v.ctlData.lo = lo;

    return v;

  } );

}


function _storeControlData( v ) {

  log( 'info', 'storing control data for agenda %s', v.agenda.id );

  return p.wn.call( store.set, v.agenda.uid, v.ctlData )

  .then( () => v );

}

function _getControlData( v ) {

  log( 'retrieving control data for agenda %s', v.agenda.id );

  return p.wn.call( store.get, v.agenda.uid )

  .then( ctlData => {

    log( ctlData ? 'control data retrieved for agenda %s' : 'control data could not be retrieved for agenda %s', v.agenda.id );

    v.ctlData = ctlData;

    return v;

  } );

}

function _append( v ) {

  return p.w.promise( function( rs, rj ) {

    log( 'appending events to control data' );

    _appendEvents( v.agenda, v.ctlData, function( err, result ) {

      if ( err ) return rj( err );

      v.ctlData = result;

      rs( v );

    });

  });

}

function _loadBase( v ) {

  return p.w.promise( function( rs, rj ) {

    log( 'getting base control data' );

    v.dbInstance.getControlData( false, function( err, ctlData ) {

      if ( err ) return rj( err );

      v.ctlData = ctlData;

      return rs( v );

    });

  });

}

function _loadAgenda( v ) {

  return p.w.promise( function( rs, rj ) {

    log( 'loading agenda' );

    model.agendas().get( { id: v.agendaId }, function( err, a ) {

      if ( err ) return rj( err );

      if ( !a ) return rj( 'no agenda found' );

      v.dbInstance = model.agendas().instance( a );

      v.agenda = svc.instanciate( a );

      rs( v );

    } );

  });

}

function _assessEventSlugRequirement( v ) {

  return config.knex( 'review_embed' )
    .select( 'store' )
    .where( 'review_id', v.agenda.id )
    .then( embeds => {

      try {

        if ( embeds
          .map( embed => phpJs.unserialize( embed.store ) )
          .filter( store => _.get( store, 'layout.use_event_slug' ) )
          .length
        ) {

          v.useEventSlug = true;

        }

      } catch ( e ) {

        log( 'error', 'failed to parse embed store for agenda %s', v.agenda.id );

      }

      return v;

    } );

}


function _loadEvent( v ) {

  const d = p.w.defer();

  log( 'loading event %s', v.eventId );

  eventSvc.get( { id: v.eventId }, ( err, event ) => {

    if ( err ) return d.reject( err );

    log( event ? 'loaded event %s' : 'no event found for id %s', v.eventId );

    v.event = event;

    d.resolve( v );

  } );

  return d.promise;

}


function _appendEvents( v ) {

  const d = p.w.defer();

  let hasMore = true, page = 1;

  async.doWhilst( wcb => {

    v.agenda.search( { passed: 1 }, { limit: 40, page }, ( err, result ) => {

      if ( err ) return wcb( err );

      result.events.forEach( _appendEvent.bind( null, v ) );

      hasMore = !!result.events.length;

      page++;

      wcb();

    } );

  },

  () => hasMore,

  err => {

    if ( err ) return d.reject( err );

    d.resolve( v );

  } );

  return d.promise;

}


function _appendEvent( v, event ) {

  if ( arguments.length === 1 ) {

    event = v.event;

  }

  const eInst = eventSvc.instanciate( event );

  const l = _extractLocation( eInst );

  const e = _extractEvent( v.agenda, eInst, v );

  if ( v.ctlData.ev.map( ev => ev.u ).indexOf( e.u ) == -1 ) {

    v.ctlData.ev.push( e );

  }

  if ( l && v.ctlData.l.map( lc => lc.u ).indexOf( l.u ) == -1 ) {

    v.ctlData.l.push( l );

  }

  return v;

}


function _removeEvent( v ) {

  const eInst = eventSvc.instanciate( v.event );

  const locationUid = eInst.getLocationUid();

  // pop event from list
  
  v.ctlData.ev = v.ctlData.ev.filter( e => e.u !== eInst.uid );

  // pop location from list if no other event uses it
  
  if ( !v.ctlData.ev.filter( e => e.l === locationUid ).length ) {

    v.ctlData.l = v.ctlData.l.filter( l => l.u !== locationUid );

  }

  return v;

}


function _extractLocation( event ) {

  if ( !event.hasValidLocation() ) return false;

  return {
    u: event.getLocationUid(),
    lt: event.getLatitude(),
    lg: event.getLongitude()
  };

}

function _getTimingDate( t, timezone ) {

  return moment.tz( t.start, timezone ).format( 'YYYY-MM-DD' );

}

function _extractEvent( agenda, event, options = {} ) {

  const parsed = {
    u: event.uid,
    l: event.getLocationUid()
  };

  if ( options.useEventSlug ) {

    parsed.s = event.slug;

  }

  parsed.tz = event.getLocationDetails().timezone;

  // this is syncronous
  event.getAgendaTags( agenda.id, function( err, tags ) {

    parsed.t = tags.map( function( t ) { return t.slug; } );

  } );

  event.getAgendaCategory( agenda.id, function( err, category ) {

    if ( category ) parsed.c = category.slug;

  });

  event.getOrganization( agenda.id, function( err, org ) {

    if ( !org || typeof org.slug !== 'string' || !org.slug.length ) return;

    parsed.org = {
      l: org.label,
      s: org.slug
    }

  });

  parsed.d = utils.unique( event.getTimings().map( function( t ) {

    return _getTimingDate( t, parsed.tz );

  }) );

  return parsed;

}

function loadServices() {

  svc = require( '../../' );

  eventSvc = require( '../../../event' );

}
