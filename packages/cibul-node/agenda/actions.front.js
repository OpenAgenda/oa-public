"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const w = require( 'when' );

const agendas = require( '@openagenda/agendas' );
const agendaEvents = require( '@openagenda/agenda-events' );
const agendaStakeholders = require( '@openagenda/agenda-stakeholders' );
const cbify = require( '@openagenda/utils/cbify' );
const sessions = require( '@openagenda/sessions' );
const keysSvc = require( '@openagenda/keys' );
const agendaDocx = require( '@openagenda/agenda-docx' );
const __ = require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/errors' ) );
const cmn = require( '../lib/commons-app' );
const getActionLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/event/actions' ) );
const modLib = require( '../lib/moduleLib' );
const eventSvc = require( '../services/event' );
const agendaSvc = require( '../services/agenda' );
const model = require( '../services/model' );


const routes = {

    agendaActionShow: [ 'get', '/', [
      sessions.middleware.load( { detailed: true } ),
      loadKey(),
      cmn.ifIs( 'agenda.private', cmn.checkStakeholder ),
      _loadDocxPath,
      actionShow
    ] ],

    agendaEventAdd: [ 'get', '/add/:eventUid', [
      _verifyIP,
      sessions.middleware.load(),
      sessions.middleware.ifUnlogged( cmn.redirectTo() ),
      eventSvc.mw.load( 'eventUid', 'uid', { inAgendaContext: false } ),
      _getRedirect,
      cmn.checkStakeholder,
      _verifyAlreadyAdded,
      eventAdd
    ] ],

    agendaEventRemove: [ 'get', '/remove/:eventUid', [
      _verifyIP,
      sessions.middleware.load(),
      sessions.middleware.ifUnlogged( cmn.redirectTo() ),
      eventSvc.mw.load( 'eventUid', 'uid' ),
      _getRedirect,
      cmn.checkStakeholder,
      _isContributorSharer,
      eventRemove
    ] ]

  };



module.exports = function( p ) {

  var router = modLib.Router( routes );

  router.pre( [
    agendaSvc.mw.load( 'slug' ),
    cmn.loadLogger( 'actions front' )
  ] );

  return {
    load: router.load( p ),
    paths: modLib.getPaths( p, routes )
  };

}


function loadKey() {

  return cbify( async ( req, res, next ) => {

    if ( req.user ) {

      try {

        req.userKey = await keysSvc( { identifier: req.user.uid, type: 'userPublic' } ).get();

      } catch ( e ) {

        req.log( 'user public key not found for user', req.user.uid || req.user, 'error:', e );

      }

    }

    next();

  } );

}


function _loadDocxPath( req, res, next ) {

  agendaDocx.getState( req.agenda.uid ).then( state => {

    req.docxPath = _.get( state, 'file.path' );

    next();

  }, next );

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
    key: req.userKey ? req.userKey.key : undefined,
    hasAggregator: false,
    docxPath: req.docxPath,
    agendas: [],
    xhr: req.xhr,
    includeActionLinks: false,
    scriptParams: {
      uid: req.agenda.uid,
      lang: req.lang,
      languages: []
    },
    search: req.query.oaq,
    logged: false
  } )

  .then( v => {

    return new Promise( ( rs, rj ) => {

      req.agenda.getLanguages( ( err, languages ) => {

        if ( err ) return rj( err );

        v.scriptParams.languages = languages;

        rs( v );

      } );

    } );

  } )

  .then( function( values ) {

    return sessions.isLogged( req ).then( is => {

      values.logged = is;

      if ( !is ) {

        return values;

      }

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

      } );

    } );

  })

  .then( function( values ) {

    if ( !values.logged ) return values;

    return w.promise( ( rs, rj ) => {

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

        rs( values );

      })

    });

  } )

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

      agendaEvents.legacyTransfer( {
        eventId: req.event.id,
        agendaId: req.agenda.id
      }, {
        context: {
          aggregated: false,
          userUid: req.user.uid,
          agendaUid: req.agendaUid
        }
      } ).then( () => {

        req.log( 'info', {
          message: 'eventAdd added to agenda',
          user: req.user,
          eventUid: req.event.uid,
          agendaUid: req.agenda.uid
        } );

      } );

      return _onActionComplete( req, res, true, getActionLabel( contributionSettings.defaultState === 2 ? 'agendaSharePublished' : 'agendaShareToControl', { agenda: req.agenda.title }, req.lang ) );

    } );

  } );


}


function eventRemove( req, res ) {

  req.agenda.removeEvent( req.event, req.user, async function( err ) {

    if ( err ) {

      req.log( 'error', 'eventRemove: %s', err );

      _onActionComplete( req, res, false, getActionLabel( 'agendaShareRemoveError', { agenda: req.agenda.title } , req.lang ) );

    } else {

      try {

        await agendaEvents( req.agenda.uid ).remove( req.event.uid, { context: {
          userUid: req.user.uid,
          agendaUid: req.query.sourceAgendaUid,
          deletion: true
        } } );

      } catch ( e ) {

        req.log( 'error', { message: 'could not remove agenda-events reference', error: e } );

      }

      _onActionComplete( req, res, true, getActionLabel( 'agendaShareRemoved', { agenda: req.agenda.title }, req.lang ) );

    }

  });

}


function _verifyIP( req, res, next ) {

  agendas.get( req.agenda.id, { private: null }, ( err, agenda ) => {

    if ( err ) return next( err );

    if ( !agenda ) return next( 'agenda not found' );

    if ( !agenda.settings.contribution.authorizedIpAddresses ) return next();

    if ( !agenda.settings.contribution.authorizedIpAddresses.length ) return next();

    if ( agenda.settings.contribution.authorizedIpAddresses.includes( req.header( 'x-forwarded-for' ) ) ) return next();

    res.redirect( 302, req.genUrl( 'agendaUnauthorized', { slug: req.agenda.slug } ) );

  } );

}


function _isContributorSharer( req, res, next ) {

  agendaStakeholders.agenda( req.agenda.id ).get( { userId: req.user.id }, ( err, stakeholder ) => {

    if ( err ) return next( err );

    if ( !stakeholder ) return _unauthorized( req, res );

    const role = agendaStakeholders.types.codes.get( stakeholder.credential );

    // if user is moderator or admin, we can proceed
    if ( [ 'administrator', 'moderator' ].includes( role ) ) {

      return next();

    }

    // user can remove only if he added the event.
    model.lib.query( 'select user_id from review_article where event_id = ? and review_id = ? limit 1', [ req.event.id, req.agenda.id ], ( err, rows ) => {

      if ( err ) return next( err );

      if ( !rows.length ) return _unauthorized( req, res );

      if ( rows[ 0 ].user_id !== req.user.id ) return _unauthorized( req, res );

      next();

    } );

  } );

}

function _unauthorized( req, res ) {

  _onActionComplete( req, res, false, getActionLabel( 'agendaShareRemoveUnauthorized', { agenda: req.agenda.title } , req.lang ) )

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

  res.redirect( 302, req.genUrl( 'agendaEventActionShow', {
    slug: req.agenda.slug,
    eventSlug: req.event.slug
  } ) );

}
