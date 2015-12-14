"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

coms = require( '../lib/coms' ),

agendaSvc = require( '../services/agenda' ),

utils = require( 'utils' ),

config = require( '../config' ),

genUrl = require( '../services/genUrl' ),

bodyParser = require( 'body-parser' ),

tagMw = require( 'agenda-tags' ).mw( 'agenda.id', 'tagSet' ),

categoryMw = require( 'agenda-categories' ).mw( 'agenda.id', 'categorySet' ),

routes = {

  categoryTagShow: [ 'get', '/:slug/admin/tagcat', [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    cmn.checkCredential( 'tags', { namespace: 'hasTagsCred' } ),
    tagMw.get,
    categoryMw.get,
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oa.css' ),
    show
  ] ],

  categoryTagUpdate: [ 'post', '/:slug/admin/tagcat', [
    bodyParser.json(),
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    tagMw.set,
    categoryMw.set,
    updateResponse
  ] ]

}

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    cmn.requireLogged( { redirect: 'agendaSignup', redirectParams: [ 'slug' ] } )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}

function updateResponse( req, res ) {

  if ( res.statusCode && res.statusCode !== 200 ) {

    return rs.send( 'nok' );

  }

  req.agenda.queue( 'resync' );

  res.send( 'ok' );

}

function show( req, res ) {

  cmn.render( req, res, 'categories/index', {
    scriptParams: {
      updateRes: req.genUrl( 'categoryTagUpdate', { slug: req.agenda.slug } ),
      tagSet: req.tagSet,
      categorySet: req.categorySet,
      lang: req.lang,
      useTags: req.hasTagsCred
    }
  } );

}