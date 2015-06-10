"use strict";

var log = require( '../../lib/logger' )( 'agenda service' ),

config = require( '../../config' ),

model = require( '../model' ),

lib = require( '../../lib/lib' ),

coms = require( '../../lib/coms' ),

es = require( '../es/es' ),

async = require( 'async' ),

eventSvc = require( '../event' ),

cache = require( '../cache' ),

utils = require( '../../lib/utils' );

module.exports = {
  list: model.agendas().list,
  get: get,
  instanciate: instanciate
}

module.exports.mw = require( './middleware' )( module.exports );

module.exports.exports = require( './exportLib' )( module.exports ); 

function get( params, cb ) {

  model.agendas().get( params, function( err, result ) {

    if ( err ) return cb( err );

    if ( !result ) return cb( 'agenda not found' );

    cb( null, instanciate( result ) );

  });

}

function instanciate( data ) {

  var instance = model.agendas().instance( data )

  return cache( 'agenda', lib.extend( {}, instance, {
    addEvent: addEvent,
    removeEvent: removeEvent,
    getControlData: getControlData,
    search: search
  }), [ 'getControlData' ], [ 'addEvent', 'removeEvent' ] );

  function search( query, options, cb ) {

    es.agendas( instance ).search( query, options, cb );

  }

  function addEvent( event, stakeholder, cb ) {

    instance.isStakeholder( stakeholder, function( err, is ) {

      if ( err ) return cb( err );

      if ( !is ) return cb( 'you cannot contribute to this agenda' );

      instance.addEvent( event, stakeholder, function( err, result ) {

        if ( err ) return cb( err );
        
        coms.publish( config.mainChannel, { 
          name: 'event.update', 
          values: { id: event.id } 
        } );

        // legacy aggregator
        coms.queue( config.legacyQueue, JSON.stringify( { name: 'review.article_display', values: {
          event_id: event.id, 
          review_id:  instance.id
        } } ), { raw: true } );

        cb();

      } );
      
    } );


  }

  function removeEvent( event, stakeholder, cb ) {

    instance.isStakeholder( stakeholder, function( err, is ) {

      if ( err ) return cb( err );

      if ( !is ) return cb( 'you cannot contribute to this agenda' );

      instance.removeEvent( event, function( err, count ) {

        if ( err ) return cb( err );

        coms.publish( config.mainChannel, { name: 'event.update', values: { id: event.id } } );

        // legacy aggregator
        coms.queue( config.legacyQueue, JSON.stringify( { name: 'review.article_hide', values: {
          event_id: event.id, 
          review_id:  instance.id
        } } ), { raw: true } );

        cb();

      });

    } );

  }

  function getControlData( cb ) {

    instance.getControlData( false, function( err, ctlData ) {

      if ( err ) return cb( err );

      _appendEvents( ctlData, cb );

    } );

  }

  function _appendEvents( ctlData, cb ) {

    var hasMore = true, page = 1, eIndex = [], eUids =[], lIndex = [], lUids = [];

    async.doWhilst( function( wcb ) {

      search( { passed: 1 }, { limit: 40, page: page }, function( err, result ) {

        if ( err ) return wcb( err );

        result.events.forEach( function( event ) {

          var eInst = eventSvc.instanciate( event ),

          l = _extractLocation( eInst ),

          e = _extractEvent( eInst );

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

  function _extractEvent( event ) {

    var parsed = {
      u: event.uid,
      l: event.getLocationUid()
    };

    // this is syncronous
    event.getAgendaTags( instance.id, function( err, tags ) {

      parsed.t = tags.map( function( t ) { return t.slug; } );

    } );

    event.getAgendaCategory( instance.id, function( err, category ) {

      if ( category ) parsed.c = category.slug;

    });

    event.getOrganization( instance.id, function( err, org ) {

      if ( org ) parsed.org = {
        l: org.label,
        s: org.slug
      }

    });

    parsed.d = utils.unique( event.getTimings().map( function( t ) {

      return _getTimingDate( t );

    }) );

    return parsed;

  }


  function _parseAndAppendEvent( eIndex, event ) {

    var parsed = {
      u: event.uid,
      l: {}
    },

    eInst = eventSvc.instanciate( event );

    // this is syncronous
    eInst.getAgendaTags( instance.id, function( err, tags ) {

      parsed.t = tags.map( function( t ) { return t.slug; } );

    } );

    eInst.getAgendaCategory( instance.id, function( err, category ) {

      if ( category ) parsed.c = category.slug;

    });

    eInst.getOrganization( instance.id, function( err, org ) {

      if ( org ) parsed.org = {
        l: org.label,
        s: org.slug
      }

    });

    

    eIndex[ event.uid ] = parsed;

  }

}

function _getTimingDate( t ) {

  var d = new Date( t.start );

  return [ 
    d.getFullYear(), 
    utils.fZ( d.getMonth() + 1 ), 
    utils.fZ( d.getDate() )
  ].join( '-' );

}

