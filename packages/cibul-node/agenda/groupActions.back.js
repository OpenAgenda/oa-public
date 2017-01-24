"use strict";

const sessions = require( 'sessions' ),

  modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  i18n = require( '../i18n/i18n' ),

  agendaSvc = require( '../services/agenda' ),

  eventSvc = require( '../services/event' ),

  routes = {

    agendaChangeEventStates: [ 'post', '/events/states', [
      agendaSvc.mw.load( 'uid' ),
      changeStates
    ] ]

  },

  l = {
    a: require( 'labels' )( require( 'labels/agendas/actions' ) ),
    e: require( 'labels' )( require( 'labels/agendas/errors' ) ),
    s: require( 'labels' )( require( 'labels/event/states' ) )
  };

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'group actions' ),
    agendaSvc.mw.load( 'uid' ),
    cmn.checkAdminOrModerator
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function changeStates( req, res, next ) {

  let redirectRes = req.genUrl( 'agendaAdminShow', { slug: req.agenda.slug } ),

  labels = {},

  stateSwitch;

  labels[ eventSvc.STATETYPES.NOTVALIDATED ] = 'tobecontrolled';
  labels[ eventSvc.STATETYPES.VALIDATED ] = 'controlled';
  labels[ eventSvc.STATETYPES.PUBLISHED ] = 'published';

  if ( !req.body.state.length ) {

    sessions.setFlash( req, l.e( 'selectActionBefore', req.lang ) );

    res.redirect( 302, redirectRes );

    return;

  }

  stateSwitch = {
    readytopublished: [ eventSvc.STATETYPES.VALIDATED, eventSvc.STATETYPES.PUBLISHED ],
    publishedtoready: [ eventSvc.STATETYPES.PUBLISHED, eventSvc.STATETYPES.VALIDATED ],
    tocontroltoready: [ eventSvc.STATETYPES.NOTVALIDATED, eventSvc.STATETYPES.VALIDATED ],
    readytotocontrol: [ eventSvc.STATETYPES.VALIDATED, eventSvc.STATETYPES.NOTVALIDATED ]
  }[ req.body.state ];

  if ( !stateSwitch ) {

    sessions.setFlash( req, l.e( 'unknownAction', req.lang ) );

    return res.redirect( 302, redirectRes );

  }

  req.agenda.changeEventStates( stateSwitch[ 0 ], stateSwitch[ 1 ], err => {

    if ( err ) return next( err );

    req.log( 'info', 'changing state of agenda events from %s to %s', labels[ stateSwitch[ 0 ] ], labels[ stateSwitch[ 1 ] ] );

    sessions.setFlash( req, l.a( 'actionsInProcess', { 
      '%oldstate%' : '<strong>' + l.s( labels[ stateSwitch[ 0 ] ], req.lang ) + '</strong>',
      '%newstate%' : '<strong>' + l.s( labels[ stateSwitch[ 1 ] ], req.lang ) + '</strong>'
    }, req.lang ) );

    res.redirect( 302, redirectRes );

  } );

}