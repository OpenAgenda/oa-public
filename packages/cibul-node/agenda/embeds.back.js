"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

agendaSvc = require( '../services/agenda' ),

embedSvc = require( '../services/embed/embed' ),

model = require( '../services/model' ),

routes = {

  switchToV2: [ 'get', '/:embedUid/switch', [
    cmn.checkAdministrator(),
    switchToV2
  ] ]

};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    agendaSvc.mw.load( 'slug' ),
    embedSvc.mw.load( 'embedUid', 'uid' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function switchToV2( req, res, next ) {

  // bit ugly but temporary.
  
  model.lib.update( 'reviewEmbeds', { uid: req.embed.uid }, { version: 2 }, function( err, result ) {

    if ( err ) return next( err );

    req.log( 'info', {
      action: 'switchToV2', 
      embedId: req.embed.id,
      agendaSlug: req.agenda.slug
    } );

    res.setFlash( req, 'You can now configure and use the latest embed codes on your website' );

    res.redirect( 302, req.genUrl( 'agendaEmbedIndex', { slug: req.agenda.slug } ) );

  });

}