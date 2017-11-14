"use strict";

const sessions = require( '@openagenda/sessions' ),

  modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  agendaSvc = require( '../services/agenda' ),

  fb = require( '@openagenda/facebook' ),

  utils = require( '@openagenda/utils' ),

  config = require( '../config' ),

  genUrl = require( '../services/genUrl' ),

  __ = require( '@openagenda/labels' )( require( '@openagenda/labels/agendas/actions' ) ),

  routes = {

    facebookShow: [ 'get', '/:slug/admin/facebook', [
      agendaSvc.mw.load( 'slug' ),
      cmn.checkAdministrator(),
      agendaSvc.mw.loadAdminLayout,
      cmn.loadBaseData( 'oasfmain.css' ),
      show
    ] ],

    facebookTabLink: [ 'get', '/agendas/:uid/facebook/tab/link', [
      agendaSvc.mw.load( 'uid' ),
      cmn.checkAdministrator(),
      fb.tab.create
    ] ],

    facebookTabRedirect: [ 'get', '/facebook/tab/create/:state', [
      fb.tab.redirect,
      _onComplete
    ] ]

  }

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    sessions.middleware.ifUnlogged( cmn.redirectTo( 'agendaSignup', { slug: 'slug' } ) )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function show( req, res ) {

  cmn.render( req, res, 'facebook/index', {} );

}


function _onComplete( req, res, next ) {

  agendaSvc.get( { id: req.agendaId }, function( err, agenda ) {

    if ( err ) return next( req.query.error_msg ? req.query.error_msg : err );

    sessions.setFlash( req, res, __( 'facebookTabAdded', req.lang ) );

    res.redirect( req.genUrl( 'facebookShow', { slug: agenda.slug } ) );

  });

}