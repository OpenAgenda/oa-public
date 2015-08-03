"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

log = require( '../lib/logger' )( 'agenda/facebook' ),

agendaSvc = require( '../services/agenda' ),

fb = require( 'facebook' ),

utils = require( 'utils' ),

config = require( '../config' ),

genUrl = require( '../services/genUrl' ),

routes = {

  facebookShow: [ 'get', '/:slug/admin/facebook', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator,
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData(),
    show
  ] ],

  facebookTabLink: [ 'get', '/agendas/:uid/facebook/tab/link', [
    agendaSvc.mw.load( 'uid' ),
    cmn.checkAdministrator,
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
    cmn.flashSetter,
    cmn.loadSession
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

    res.setFlash( req, 'The agenda tab was added to your page' );

    res.redirect( req.genUrl( 'facebookShow', { slug: agenda.slug } ) );

  });

}