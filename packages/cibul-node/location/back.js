"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

bodyParser = require( 'body-parser' ),

agendaSvc = require( '../services/agenda' ),

mw = require( 'agenda-locations' ).mw(),

routes = {

  locationIndex: [ 'get', '/:slug/locations', [
    cmn.loadUserUid,
    mw.list,
    showList
  ] ],

  agendaAdminLocations: [ 'get', '/:slug/admin/locations', [
    cmn.checkAdminOrModerator,
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oasfmain.css' ),
    cmn.loadUserUid,
    mw.loadSettings,
    show
  ] ],

  agendaLocationSet: [ 'post', '/:slug/locations', [
    bodyParser.json(),
    _checkCreate,
    cmn.loadUserUid,
    mw.setToValidate
  ] ],

  agendaAdminLocationSet: [ 'post', '/:slug/admin/locations', [
    bodyParser.json(),
    cmn.loadUserUid,
    mw.set
  ] ],

  agendaAdminLocationRemove: [ 'post', '/:slug/admin/locations/remove', [
    cmn.checkAdminOrModerator,
    bodyParser.json(),
    cmn.loadUserUid,
    mw.remove
  ] ],

  agendaAdminLocationMerge: [ 'post', '/:slug/admin/locations/merge', [
    cmn.checkAdminOrModerator,
    bodyParser.json(),
    mw.merge
  ] ],

  agendaAdminLocationTerms: [ 'get', '/:slug/admin/locations/terms', [
    cmn.checkAdminOrModerator,
    mw.list.terms
  ] ],

  locationGetStakeholder: [ 'get', '/:slug/admin/locations/stakeholders/:stakeholderId', [
    cmn.checkAdminOrModerator,
    ( req, res, next ) => { req.agendaId = req.agenda.id; req.stakeholderId = req.params.stakeholderId; next(); },
    mw.getStakeholder
  ] ],

  locationGeocode: [ 'get', '/:slug/locations/geocode', [
    cmn.loadUserUid,
    mw.geocode
  ] ],

  locationResync: [ 'get', '/:slug/admin/locations/resync', [
    cmn.checkAdminOrModerator,
    mw.resync,
    _resyncSuccess
  ] ],

  locationToVerifyCount: [ 'get', '/:slug/admin/locations/verifycount', [
    cmn.checkAdminOrModerator,
    mw.getUnverifiedCount
  ] ],

  locationNewImageUpload: [ 'post', '/:slug/locations/image', [
    cmn.loadUserUid,
    mw.newImageUpload
  ] ],

  locationNewImageRemove: [ 'post', '/:slug/locations/image/remove', [
    cmn.loadUserUid,
    mw.newImageRemove
  ] ],

  locationImageUpload: [ 'post', '/:slug/locations/:locationUid/image', [
    cmn.checkAdminOrModerator,
    cmn.loadUserUid,
    mw.imageUpload
  ] ],

  locationImageRemove: [ 'post', '/:slug/locations/:locationUid/image/remove', [
    cmn.checkAdminOrModerator,
    cmn.loadUserUid,
    mw.imageRemove
  ] ],

  agendaLocationGet: [ 'get', '/:slug/locations/:locationUid', [
    mw.load, ( req, res ) => { res.json( req.location ); }
  ] ]

}

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    cmn.requireLogged( { redirect: 'agendaSignup', redirectParams: [ 'slug' ] } ),
    agendaSvc.mw.load( 'slug' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function show( req, res ) {

  // attempt a settings load

  cmn.render( req, res, 'locations/index', {
    scriptParams: {
      detailedInfo: true,
      settings: req.settings,
      lang: req.lang,
      agenda: {
        slug: req.agenda.slug,
        title: req.agenda.title,
        uid: req.agenda.uid
      },
      res: {
        index: req.genUrl( 'locationIndex', { slug: req.agenda.slug } ),
        geocode: req.genUrl( 'locationGeocode', { slug: req.agenda.slug } ),
        seeEvents: req.genUrl( 'agendaAdminShow', { slug: req.agenda.slug } ) + '?locationUid=:locationUid',
        set: req.genUrl( 'agendaAdminLocationSet', { slug: req.agenda.slug } ),
        get: req.genUrl( 'agendaLocationGet', { slug: req.agenda.slug, locationUid: ':locationUid' } ),
        getStakeholder: req.genUrl( 'locationGetStakeholder', { slug: req.agenda.slug, stakeholderId: ':stakeholderId' } ),
        remove: req.genUrl( 'agendaAdminLocationRemove', { slug: req.agenda.slug } ),
        merge: req.genUrl( 'agendaAdminLocationMerge', { slug: req.agenda.slug } ),
        image: {
          newUpload: req.genUrl( 'locationNewImageUpload', { slug: req.agenda.slug } ),
          newRemove: req.genUrl( 'locationNewImageRemove', { slug: req.agenda.slug } ),
          upload: req.genUrl( 'locationImageUpload', { slug: req.agenda.slug, locationUid: ':locationUid' } ),
          remove: req.genUrl( 'locationImageRemove', { slug: req.agenda.slug, locationUid: ':locationUid' } )
        }
      }
    }
  } );

}

function _resyncSuccess( req, res, next ) {

  res.setFlash( req, 'resync is ongoing' );

  res.redirect( req.genUrl( 'agendaAdminLocations', { slug: req.agenda.slug } ) );

}


function showList( req, res, next ) {

  if ( req.xhr ) {

    return res.json( {
      items: req.locations.items,
      total: req.locations.total
    } );

  }

  next();

}


function _checkCreate( req, res, next ) {

  if ( req.body && !req.body.uid && !req.body.id ) {

    return next();

  }

  // there is an identifier. So a set is for moderators.
  cmn.checkAdminOrModerator( req, res, next );

}