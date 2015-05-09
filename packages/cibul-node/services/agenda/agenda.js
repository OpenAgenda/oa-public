"use strict";

var log = require( '../../lib/logger' )( 'agenda service' ),

config = require( '../../config' ),

model = require( '../model' ),

lib = require( '../../lib/lib' ),

coms = require( '../../lib/coms' ),

es = require( '../es/es' ),

async = require( 'async' ),

eventSvc = require( '../event/event' ),

cache = require( '../cache' ),

utils = require( '../../lib/utils' );

module.exports = {
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
        
        coms.publish( config.mainChannel, { name: 'event.update', values: { id: event.id } } );

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

    var hasMore = true, page = 1, eIndex = ctlData.a;

    async.doWhilst( function( wcb ) {

      search( { passed: 1 }, { limit: 40, page: page }, function( err, result ) {

        if ( err ) return wcb( err );

        result.events.forEach( function( event ) {

          _parseAndAppendEvent( eIndex, event );

        });

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

  function _parseAndAppendEvent( eIndex, event ) {

    var parsed = {
      uid: event.uid,
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

    if ( eInst.hasValidLocation() ) {

      parsed.l[ eInst.getLocationName().slug ] = {
        p: eInst.getLocationName().label,
        a: eInst.getAddress().label,
        ct: eInst.getCity().label,
        d: eInst.getTimings().map( _getTimingDate ),
        pc: eInst.getPostalCode().label,
        lt: eInst.getLatitude(),
        lg: eInst.getLongitude()
      };

    }

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

