"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

bodyParser = require( 'body-parser' ),

agendaSvc = require( '../services/agenda' ),

mw = require( 'agenda-locations' ).mw(),

userSvc = require( '../services/user' ),

routes = {

  locationIndex: [ 'get', '/:slug/locations', [
    _loadUserUid,
    mw.list,
    showList
  ] ],

  agendaAdminLocations: [ 'get', '/:slug/admin/locations', [
    cmn.checkAdministrator(),
    agendaSvc.mw.loadAdminLayout,
    cmn.loadBaseData( 'oa.css' ),
    _loadUserUid,
    show
  ] ],

  agendaAdminLocationSet: [ 'post', '/:slug/locations', [
    bodyParser.json(),
    _loadUserUid,
    mw.set
  ] ],

  agendaAdminLocationRemove: [ 'post', '/:slug/admin/locations/remove', [
    cmn.checkAdministrator(),
    bodyParser.json(),
    _loadUserUid,
    mw.remove
  ] ],

  agendaAdminLocationMerge: [ 'post', '/:slug/admin/locations/merge', [
    cmn.checkAdministrator(),
    bodyParser.json(),
    mw.merge
  ] ],

  locationGeocode: [ 'get', '/:slug/locations/geocode', [
    _loadUserUid,
    mw.geocode
  ] ],

  locationNewImageUpload: [ 'post', '/:slug/locations/image', [
    _loadUserUid,
    mw.newImageUpload
  ] ],

  locationNewImageRemove: [ 'post', '/:slug/locations/image/remove', [
    _loadUserUid,
    mw.newImageRemove
  ] ],

  locationImageUpload: [ 'post', '/:slug/locations/:locationUid/image', [
    cmn.checkAdministrator(),
    _loadUserUid,
    mw.imageUpload
  ] ],

  locationImageRemove: [ 'post', '/:slug/locations/:locationUid/image/remove', [
    cmn.checkAdministrator(),
    _loadUserUid,
    mw.imageRemove
  ] ]

}

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    cmn.requireLogged( { redirect: 'agendaSignup', redirectParams: [ 'slug' ] } ),
    agendaSvc.mw.load( 'slug' ),
    cmn.checkCredential( 'location' )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function show( req, res ) {

  cmn.render( req, res, 'locations/index', {
    scriptParams: {
      detailedInfo: true,
      lang: req.lang,
      res: {
        index: req.genUrl( 'locationIndex', { slug: req.agenda.slug } ),
        geocode: req.genUrl( 'locationGeocode', { slug: req.agenda.slug } ),
        set: req.genUrl( 'agendaAdminLocationSet', { slug: req.agenda.slug } ),
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


function showList( req, res, next ) {

  if ( req.xhr ) {

    return res.json( {
      items: req.locations.items,
      total: req.locations.total
    } );

  }

  next();

}


function _loadUserUid( req, res, next) {

  userSvc.get( { id: req.user.id }, ( err, user ) => {

    if ( err ) return next( err );

    req.userUid = user.uid;

    next();

  } );

}