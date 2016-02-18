"use strict";

var utils = require( 'utils' ),

store = require( './store' ),

w = require( 'when' ),

log = require( 'logger' )( 'controlData', { lib: 'build' } ),

async = require( 'async' ),

model = require( '../../../model' ),

svc, eventSvc;

module.exports = function( data, cb ) {

  loadServices();

  log( 'info', 'processing for %s', data.id );

  w( {
    agendaId: data.id,
    dbInstance: false, // model instance
    agenda: false,     // service instance
    ctlData: false     // control data
  } )

  .then( _loadAgenda )

  .then( _loadBase ) // init ctlData

  .then( _append ) // append events to ctlData

  .then( _store ) // store ctlData

  .done( function( v ) {

    log( 'info', 'control data loaded for %s', data.id );

    cb( null, v.ctlData );

  }, function( err ) {

    log( 'error', err );

    cb( err ); // queue lib does not handle errors

  });

}

function _store( v ) {

  return w.promise( function( rs, rj ) {

    log( 'info', 'storing control data for agenda %s', v.agenda.id );

    store.set( v.agenda.uid, v.ctlData, function( err ) {

      if ( err ) return rj( err );

      rs( v );

    } );

  });

}

function _append( v ) {

  return w.promise( function( rs, rj ) {

    log( 'appending events to control data' );

    _appendEvents( v.agenda, v.ctlData, function( err, result ) {

      if ( err ) return rj( err );

      v.ctlData = result;

      rs( v );

    });

  });

}

function _loadBase( v ) {

  return w.promise( function( rs, rj ) {

    log( 'getting base control data' );

    v.dbInstance.getControlData( false, function( err, ctlData ) {

      if ( err ) return rj( err );

      v.ctlData = ctlData;

      return rs( v );

    });

  });

}

function _loadAgenda( v ) {

  return w.promise( function( rs, rj ) {

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


function _appendEvents( agenda, ctlData, cb ) {

  var hasMore = true, page = 1, eIndex = [], eUids =[], lIndex = [], lUids = [];

  async.doWhilst( function( wcb ) {

    agenda.search( { passed: 1 }, { limit: 40, page: page }, function( err, result ) {

      if ( err ) return wcb( err );

      result.events.forEach( function( event ) {

        var eInst = eventSvc.instanciate( event ),

        l = _extractLocation( eInst ),

        e = _extractEvent( agenda, eInst );

        if ( eUids.indexOf( e.u ) == -1 ) {

          eUids.push( e.u );

          eIndex.push( e );

        }

        if ( l && lUids.indexOf( l.u ) == -1 ) {

          lUids.push( l.u );

          lIndex.push( l );

        }

      });

      ctlData.l = lIndex;

      ctlData.ev = eIndex;

      hasMore = !!result.events.length;

      page++;

      wcb();

    } );

  }, function() {

    return hasMore;

  }, function( err ) {

    if ( err ) return cb( err );

    cb( null, ctlData );

  } );

}

function _extractLocation( event ) {

  if ( !event.hasValidLocation() ) return false;

  return {
    u: event.getLocationUid(),
    lt: event.getLatitude(),
    lg: event.getLongitude()
  };

}

function _getTimingDate( t ) {

  var d = new Date( t.start );

  return [ 
    d.getFullYear(), 
    utils.fZ( d.getMonth() + 1 ), 
    utils.fZ( d.getDate() )
  ].join( '-' );

}

function _extractEvent( agenda, event ) {

  var parsed = {
    u: event.uid,
    l: event.getLocationUid()
  };

  // this is syncronous
  event.getAgendaTags( agenda.id, function( err, tags ) {

    parsed.t = tags.map( function( t ) { return t.slug; } );

  } );

  event.getAgendaCategory( agenda.id, function( err, category ) {

    if ( category ) parsed.c = category.slug;

  });

  event.getOrganization( agenda.id, function( err, org ) {

    if ( !org || typeof org.slug !== 'string' || !org.slug.length ) return;

    parsed.org = {
      l: org.label,
      s: org.slug
    }

  });

  parsed.d = utils.unique( event.getTimings().map( function( t ) {

    return _getTimingDate( t );

  }) );

  return parsed;

}

function loadServices() {

  svc = require( '../../' );

  eventSvc = require( '../../../event' );

}