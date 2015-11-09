"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

path,

w = require( 'when' ),

eventSvc = require( '../services/event' ),

model = require( '../services/model' ),

async = require( 'async' ),

routes = {

  agendaActionShow: [ 'get', '/', actionShow ],

  agendaEventAdd: [ 'get', '/add/:eventUid', [
    cmn.requireLogged(),
    eventSvc.mw.load( 'eventUid', 'uid', { inAgendaContext: false } ),
    cmn.checkAdminOrModerator,
    _verifyAlreadyAdded,
    eventAdd
  ] ],

  agendaEventRemove: [ 'get', '/remove/:eventUid', [
    cmn.requireLogged(),
    eventSvc.mw.load( 'eventUid', 'uid' ),
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
    agenda: {
      title: req.agenda.getTitle(),
      description: req.agenda.getDescription(),
      slug: req.agenda.slug,
      uid: req.agenda.uid,
      image: req.agenda.getImage()
    },
    hasAggregator: false,
    agendas: [],
    xhr: req.xhr,
    includeActionLinks: false,
    scriptParams: {
      uid: req.agenda.uid,
      lang: req.lang
    },
    search: req.query.oaq
  } )

  .then( function( values ) {

    if ( !req.session.logged ) return values;

    return w.promise( ( rs, rj ) => {

      values.agendas = [];

      var aIds = [];

      // list agendas which have the aggregator feature and of which user is admin

      async.each( [
        { aggregator: true, adminId: req.session.userId, limit: false },
        { aggregator: true, ownerId: req.session.userId, limit: false }
      ], ( query, ecb ) => {

        model.reviews().list( query, ( err, agendas ) => {

          if ( err ) return rj( err );

          agendas.forEach( ( a ) => {

            if ( a.id == req.agenda.id ) return;

            if ( aIds.indexOf( a.id ) !== -1 ) return;

            aIds.push( a.id );

            values.agendas.push( {
              id: a.id,
              title: a.title,
              aggUid: a.uid,
              aggregates: false
            } );

          } );

          ecb();

        } );

      }, ( err, result ) => {

        if ( err ) return rj( err );

        if ( values.agendas.length ) values.hasAggregator = true;

        rs( values );

      } );

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

      req.log( 'error', 'eventAdd: %s', err );

      _onActionComplete( req, res, false, 'the event could not be added' );

    } else {

      _onActionComplete( req, res, true, 'the event was added to the agenda' );

    }

  });

}


function eventRemove( req, res ) {

  req.agenda.removeEvent( req.event, req.user, function( err ) {

    if ( err ) {

      req.log( 'error', 'eventRemove: %s', err );

      _onActionComplete( req, res, false, 'the event could not be removed' );

    } else {

      _onActionComplete( req, res, true, 'the event was removed from the agenda' );

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


function _onActionComplete( req, res, success, message ) {

  var rd = cmn.getRedirect( req );

  if ( req.xhr ) {

    cmn.renderJson( {
      success: success,
      message: message
    } );

    return;

  }

  res.setFlash( req, message );

  if ( rd ) {

    res.redirect( 302, rd );

    return;

  }

  res.redirect( 302, req.genUrl( 'eventShow', { eventSlug: req.event.slug } ) );

}