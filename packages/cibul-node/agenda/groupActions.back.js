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
    agendaSvc.mw.load( 'uid' ),
    cmn.loadSession,
    cmn.flashSetter,
    cmn.checkAdministrator()
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function changeStates( req, res, next ) {

  var redirectRes = req.genUrl( 'agendaAdminShow', { slug: req.agenda.slug } ),

  newState;

  if ( !req.body.state.length ) {

    res.setFlash( req, 'Select an action to execute before pressing the button' );

    res.redirect( 302, redirectRes );

    return;

  }

  newState = parseInt( req.body.state );

  req.agenda.changeEventStates( newState, function( err ) {

    if ( err ) return next( err );

    var labels = {}

    labels[ eventSvc.STATETYPES.NOTVALIDATED ] = 'to be controlled';
    labels[ eventSvc.STATETYPES.VALIDATED ] = 'ready to be published';
    labels[ eventSvc.STATETYPES.PUBLISHED ] = 'published';

    res.setFlash( req, 'Your action is being processed. The state of your events will shortly be changed to %newstate%.', { '%newstate%' : '<strong>' + i18n( labels[ newState ], req.lang ) + '</strong>' } );

    res.redirect( 302, redirectRes );

  } );

}