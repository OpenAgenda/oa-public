"use strict";

const sessions = require( 'sessions' ),

  __ = require( 'labels' )( require( 'labels/agendas/errors' ) ),

  modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  w = require( 'when' ),

  eventSvc = require( '../services/event' ),

  agendaSvc = require( '../services/agenda' ),

  model = require( '../services/model' ),

  async = require( 'async' ),

  getActionLabel = require( 'labels' )( require( 'labels/event/actions' ) ),

  routes = {

    agendaActionShow: [ 'get', '/', [ 
      sessions.middleware.load( { detailed: true } ),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      actionShow 
    ] ],

    agendaEventAdd: [ 'get', '/add/:eventUid', [
      sessions.middleware.load(),
      sessions.middleware.ifUnlogged( cmn.redirectTo() ),
      eventSvc.mw.load( 'eventUid', 'uid', { inAgendaContext: false } ),
      _getRedirect,
      cmn.checkStakeholder,
      _verifyAlreadyAdded,
      eventAdd
    ] ],

    agendaEventRemove: [ 'get', '/remove/:eventUid', [
      sessions.middleware.load(),
      sessions.middleware.ifUnlogged( cmn.redirectTo() ),
      eventSvc.mw.load( 'eventUid', 'uid' ),
      _getRedirect,
      cmn.checkStakeholder,
      eventRemove
    ] ]

  };

module.exports = function( p ) {

  var router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug' )
  ] );

  return {
    load: router.load( p ),
    paths: modLib.getPaths( p, routes )
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
      image: req.agenda.getImage(),
      private: req.agenda.private
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

    if ( !sessions.isLogged( req ) ) return values;

    return w.promise( ( rs, rj ) => {

      values.agendas = [];

      var aIds = [];

      // list agendas which have the aggregator feature and of which user is admin

      async.each( [
        { aggregator: true, adminId: req.user.id, limit: false },
        { aggregator: true, ownerId: req.user.id, limit: false }
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

    if ( !sessions.isLogged( req ) ) return values;

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


/**
 * added regardless of state.
 */
  
function eventAdd( req, res ) {

  req.agenda.getContributionSettings( ( err, contributionSettings ) => {

    req.agenda.addEvent( req.event, {
      stakeholder: req.user,
      publish: contributionSettings.defaultState === 2 ? true : false
    }, err => {

      if ( err ) {

        req.log( 'error', 'eventAdd: %s', err );

        return _onActionComplete( req, res, false, getActionLabel( 'agendaShareError', { agenda: req.agenda.title }, req.lang ) );

      }

      return _onActionComplete( req, res, true, getActionLabel( contributionSettings.defaultState === 2 ? 'agendaSharePublished' : 'agendaShareToControl', { agenda: req.agenda.title }, req.lang ) );

    } );

  } );


}


function eventRemove( req, res ) {

  req.agenda.removeEvent( req.event, req.user, function( err ) {

    if ( err ) {

      req.log( 'error', 'eventRemove: %s', err );

      _onActionComplete( req, res, false, getActionLabel( 'agendaShareRemoveError', { agenda: req.agenda.title } , req.lang ) );

    } else {

      _onActionComplete( req, res, true, getActionLabel( 'agendaShareRemoved', { agenda: req.agenda.title }, req.lang ) );

    }

  });

}


function _getRedirect( req, res, next ) {

  req.redirect = cmn.getRedirect( req );

  next();

}


function _verifyAlreadyAdded( req, res, next ) {

  req.agenda.hasEvent( req.event, function( err, has ) {

    if ( has ) {

      sessions.setFlash( req, res, __( 'eventAlreadyAdded', req.lang ) );

      res.redirect( req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug } ) );

      return;

    }

    next();

  } );

}


function _onActionComplete( req, res, success, message ) {

  if ( req.xhr ) {

    return cmn.renderJson( {
      success,
      message
    } );

  }

  sessions.setFlash( req, res, message )

  if ( req.redirect ) {

    return res.redirect( 302, req.redirect );

  }

  res.redirect( 302, req.genUrl( 'eventActionShow', {
    eventSlug: req.event.slug
  } ) );

}