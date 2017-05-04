"use strict";

var modLib = require( '../lib/moduleLib' ),

agendaSvc = require( '../services/agenda' ),

embedSvc = require( '../services/embed' ),

config = require( '../config' ),

shares = require( 'shares' )( config.shares.agenda ),

cmn = require( '../lib/commons-app' ),

routes = {

  agendaShare: [ 'get', '/:slug/share/:service' , [
    agendaSvc.mw.load( 'slug' ),
    share
  ] ],

  agendaEmbedShare: [ 'get', '/agendas/:uid/embed/share/:service', [
    agendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    share
  ] ]

};


module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'agenda shares' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function share( req, res, next ) {

  if ( !shares.has( req.params.service ) ) {

    return next( { code: 404, message: 'This share type does not exist' } );

  }

  req.log( 'info', { message: 'sharing agenda', uid: req.agenda.uid, slug: req.agenda.slug, service: req.params.service } );

  res.redirect( shares.getLink( req.params.service, {
    title: req.agenda.title,
    description: req.agenda.description ,
    url: req.embed ? 
      req.genUrl( 'customEmbedShow', { uid: req.agenda.uid, embedUid: req.embed.uid }, { abs: true, protocol: 'https://' } )
      : req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { abs: true, protocol: 'https://' } ),
    siteUrl: config.root
  } ) );

}