"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

path,

i18n = require( '../i18n/i18n' ),

agendaSvc = require( '../services/agenda' ),

eventSvc = require( '../services/event' ),

routes = {

  agendaChangeEventStates: [ 'post', '/events/states', [
    agendaSvc.mw.load( 'uid' ),
    changeStates
  ] ]

};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'group actions' ),
    agendaSvc.mw.load( 'uid' ),
    cmn.loadSession,
    cmn.flashSetter,
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

  labels[ eventSvc.STATETYPES.NOTVALIDATED ] = 'to be completed';
  labels[ eventSvc.STATETYPES.VALIDATED ] = 'ready to publish';
  labels[ eventSvc.STATETYPES.PUBLISHED ] = 'published';

  if ( !req.body.state.length ) {

    res.setFlash( req, 'Select an action to execute before pressing the button' );

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

    res.setFlash( req, 'the action you requested is unknown' );

    return res.redirect( 302, redirectRes );

  }

  req.agenda.changeEventStates( stateSwitch[ 0 ], stateSwitch[ 1 ], err => {

    if ( err ) return next( err );

    req.log( 'info', 'changing state of agenda events from %s to %s', labels[ stateSwitch[ 0 ] ], labels[ stateSwitch[ 1 ] ] );

    res.setFlash( req, 'Your action is being processed. Events in the state %oldstate% will shortly be changed to %newstate%.', { 
      '%oldstate%' : '<strong>' + i18n( labels[ stateSwitch[ 0 ] ], req.lang ) + '</strong>',
      '%newstate%' : '<strong>' + i18n( labels[ stateSwitch[ 1 ] ], req.lang ) + '</strong>'
    } );

    res.redirect( 302, redirectRes );

  } );

}