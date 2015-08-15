"use strict";

var model = require( '../../model' ),

utils = require( '../../../lib/utils' ),

eventSvc = require( '../../event' ),

search = require( './search' ),

sources = require( './sources' ),

async = require( 'async' ),

cache = require( '../../cache' ),

flattener = require( './flattener' ),

aggregator = require( '../../aggregator' ),

emailStrategie = require( './emailStrategie' ),

groupActions = require( './groupActions' ),

dispatcher = require( './dispatcher' );

module.exports = function( data ) {

  var instance = model.agendas().instance( data ),

  svcInstance = utils.extend( {}, instance, {
    addEvent: addEvent,
    removeEvent: removeEvent,
    getControlData: getControlData
  }),

  dsp = dispatcher( svcInstance, instance );

  search( svcInstance, instance, [
    'search',
    'searchStream',
    'aggregate'
  ]);

  sources( svcInstance, instance, [
    'sources.add',
    'sources.remove'
  ]);

  flattener( svcInstance, instance, [
    'flattener'
  ] );

  emailStrategie( svcInstance, instance, [ 
    'emailStrategie'
  ] );

  groupActions( svcInstance, instance, [
    'changeEventStates'
  ] );

  return cache( 'agenda', svcInstance, [ 'getControlData' ], [ 'addEvent', 'removeEvent' ] );


  function addEvent( event, stakeholder, cb ) {

    instance.isStakeholder( stakeholder, function( err, is ) {

      if ( err ) return cb( err );

      if ( !is ) return cb( 'you cannot contribute to this agenda' );

      instance.addEvent( event, stakeholder, function( err, result ) {

        if ( err ) return cb( err );

        dsp.onAddEvent( event.id );
        
        cb();

      } );
      
    } );


  }

  function removeEvent( event, stakeholder, cb ) {

    if ( arguments.length == 3 ) {

      return instance.isStakeholder( stakeholder, function( err, is ) {

        if ( err ) return cb( err );

        if ( !is ) return cb( 'you cannot contribute to this agenda' );

        removeEvent( event, cb );

      } );

    }

    cb = stakeholder;

    instance.removeEvent( event, function( err, count ) {

      if ( err ) return cb( err );

      dsp.onRemoveEvent( event.id );

      cb();

    });

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

      svcInstance.search( { passed: 1 }, { limit: 40, page: page }, function( err, result ) {

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