"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

path,

w = require( 'when' ),

model = cmn.getCibulModel(),

log = require( '../lib/logger' )( 'agenda actions' ),

routes = {

  agendaActionShow: [ 'get', '/', actionShow ],

  agendaEventAdd: [ 'get', '/add/:eventUid', [
    cmn.requireLogged,
    cmn.loadEvent( 'eventUid', 'uid' ),
    cmn.checkAdminOrModerator,
    _verifyAlreadyAdded,
    eventAdd
  ] ],

  agendaEventRemove: [ 'get', '/remove/:eventUid', [
    cmn.requireLogged,
    cmn.loadEvent( 'eventUid', 'uid' ),
    cmn.checkAdminOrModerator,
    eventRemove
  ] ]

};

module.exports = function( p ) {

  path = p;

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadAgenda( 'slug' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  };

}


/**
 * controllers
 */

function actionShow( req, res ) {

  w( {
    uid: req.agenda.uid,
    hasAggregator: false,
    agendas: []
  } )

  .then( function( values ) {

    if ( !req.session.logged ) return values;

    return w.promise( function( resolve, reject ) {

      // list agendas which have the aggregator feature and of which user is admin

      model.reviews().list( { aggregator: true, adminId: req.session.userId }, function( err, agendas ) {

        if ( err ) return reject( err );

        values.agendas = agendas.map( function( a ) {

          return {
            id: a.id,
            title: a.title,
            aggUid: a.uid,
            aggregates: false
          }

        }).filter( function( a ) {

          return a.id !== req.agenda.id;

        });

        if ( values.agendas.length ) values.hasAggregator = true;

        resolve( values );

      });

    });    

  })

  .then( function( values ) {

    if ( !req.session.logged ) return values;

    // get current aggregating agendas
    // and cross reference with users admined agendas

    return w.promise( function( resolve, reject ) {

      req.agenda.getAggregators( function( err, result ) {

        var aggAgendasIds = result.map( function( a ) {

          return a.id;

        });

        values.agendas.map( function( a ) {

          if ( aggAgendasIds.indexOf( a.id ) !== -1 ) {

            a.aggregates = true;

          }

          return a;

        });

        resolve( values );

      })

    });

  })

  .done( function( values ) {

    var renderParams = [ req, res, 'agenda/action', values ];

    if ( req.xhr ) {

      cmn.render.apply( null, renderParams );

    } else {

      cmn.loadBaseData( 'oa.css' )( req, res, function() {

        cmn.render.apply( null, renderParams );

      } );

    }
    
  }, cmn.catchError( req, res ) );

}



function eventAdd( req, res ) {

  req.agenda.addEvent( req.event, req.user, function( err ) {

    if ( err ) {

      log( 'error', 'eventAdd: %s', err );

      _redirectOnActionComplete( req, res, 'the event could not be added' );

    } else {

      _redirectOnActionComplete( req, res, 'the event was added to the agenda' );

    }

  });

}


function eventRemove( req, res ) {

  req.agenda.removeEvent( req.event, req.user, function( err ) {

    if ( err ) {

      log( 'error', 'eventRemove: %s', err );

      _redirectOnActionComplete( req, res, 'the event could not be removed' );

    } else {

      _redirectOnActionComplete( req, res, 'the event was removed from the agenda' );

    }

  });

}


function _verifyAlreadyAdded( req, res, next ) {

  req.agenda.hasEvent( req.event, function( err, has ) {

    if ( has ) {

      res.setFlash( req, 'event is already part of agenda' );

      res.redirect( req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } ) );

      return;

    }

    next();

  } );

}


function _redirectOnActionComplete( req, res, message ) {

  var rd = cmn.getRedirect( req );

  res.setFlash( req, message );

  if ( rd ) {

    res.redirect( rd );

    return;

  }

  cmn.redirect(req, res, 'eventShow', { eventSlug: req.event.slug } );

}