"use strict";

const sessions = require( '@openagenda/sessions' ),

  labels = require( '@openagenda/labels/agenda-tags/editor' );

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

agendaSvc = require( '../services/agenda' ),

tagMw = require( '@openagenda/agenda-tags' ).mw( 'agenda.id', 'tagSet' ),

categoryMw = require( '@openagenda/agenda-categories' ).mw( 'agenda.id', 'categorySet' ),

routes = {

  categoryTagShow: [ 'get', '/:slug/admin/tagcat', cmn.verifyIPMiddleware.concat( [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
    deprecatedShow
  ] ) ],

  customizedShow: [ 'get', '/:slug/admin/settings/customize', cmn.verifyIPMiddleware.concat( [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    cmn.checkCredential( 'tags', { namespace: 'hasTagsCred' } ),
    tagMw.get,
    categoryMw.get,
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
    show
  ] ) ],

  customizedUpdate: [ 'post', '/:slug/admin/settings/customize', cmn.verifyIPMiddleware.concat( [
    agendaSvc.mw.load( 'slug' ),
    cmn.checkAdministrator(),
    tagMw.set,
    categoryMw.set,
    updateResponse
  ] ) ]

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

function updateResponse( req, res ) {

  if ( res.statusCode && res.statusCode !== 200 ) {

    return res.send( 'nok' );

  }

  res.send( 'ok' );

}

function show( req, res ) {

  cmn.render( req, res, 'customized/index', {
    scriptParams: {
      updateRes: req.genUrl( 'customizedUpdate', { slug: req.agenda.slug } ),
      tagSet: req.tagSet,
      categorySet: req.categorySet,
      lang: req.lang,
      useTags: req.hasTagsCred
    }
  } );

}


function deprecatedShow( req, res ) {

  cmn.render( req, res, 'adminRedirect/index', {
    main: labels.redirectMain[ req.lang ],
    sub: labels.redirectSub[ req.lang ],
    tab: 'categories',
    scriptParams: {
      redirect: req.genUrl( 'customizedShow', { slug: req.agenda.slug } )
    }
  } );

}
