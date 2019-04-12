"use strict";

const _ = require( 'lodash' );
const http = require( 'http' );
const ih = require( 'immutability-helper' );

const agendaSvc = require( '@openagenda/agendas' );
const cmn = require( '../lib/commons-app' );
const modLib = require( '../lib/moduleLib' );

const mw = require( '@openagenda/agenda-locations' ).mw();
const sessions = require( '@openagenda/sessions' );

const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'locations' }
);

const checkLogging = sessions.middleware.ifUnlogged( cmn.redirectTo( 'agendaSignup', { slug: 'slug' } ) );

const config = require( '../config' );

const routes = {

    locationIndex: [ 'get', '/:slug/locations', [
      cmn.loadAgenda,
      checkLogging,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.list,
      showList
    ] ],

    agendaAdminLocations: [ 'get', '/:slug/admin/locations', [
      cmn.loadAgenda,
      checkLogging,
      cmn.verifyIPMiddleware,
      cmn.authorize.moderator,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.loadSettings(),
      show
    ] ],

    agendaAdminLocationsCsv: [ 'get', '/:slug/admin/locations/exports.csv', [
      cmn.loadAgenda,
      checkLogging,
      cmn.verifyIPMiddleware,
      cmn.authorize.moderator,
      forwardCsvExport
    ] ],

    agendaLocationSet: [ 'post', '/:slug/locations', [
      cmn.loadAgenda,
      checkLogging,
      _checkCreate,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.setToValidate
    ] ],

    agendaAdminLocationSet: [ 'post', '/:slug/admin/locations', [
      cmn.loadAgenda,
      checkLogging,
      cmn.verifyIPMiddleware,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.set
    ] ],

    agendaAdminLocationRemove: [ 'post', '/:slug/admin/locations/remove', [
      cmn.loadAgenda,
      checkLogging,
      cmn.verifyIPMiddleware,
      cmn.authorize.moderator,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.remove
    ] ],

    agendaAdminLocationMerge: [ 'post', '/:slug/admin/locations/merge', [
      cmn.loadAgenda,
      checkLogging,
      cmn.verifyIPMiddleware,
      cmn.authorize.moderator,
      mw.merge
    ] ],

    agendaAdminLocationTerms: [ 'get', '/:slug/admin/locations/terms', [
      cmn.loadAgenda,
      checkLogging,
      cmn.verifyIPMiddleware,
      cmn.authorize.moderator,
      mw.list.terms
    ] ],

    locationGetStakeholder: [ 'get', '/:slug/admin/locations/stakeholders/:stakeholderId', [
      cmn.loadAgenda,
      checkLogging,
      cmn.verifyIPMiddleware,
      cmn.authorize.moderator,
      ( req, res, next ) => {

        req.agendaId = req.agenda.id;
        req.stakeholderId = req.params.stakeholderId;

        next();

      },
      mw.getStakeholder
    ] ],

    locationGeocode: [ 'get', '/:slug/locations/geocode', [
      cmn.loadAgenda,
      checkLogging,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.geocode
    ] ],

    locationINSEE: [ 'get', '/:slug/locations/insee', [
      cmn.loadAgenda,
      checkLogging,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.insee
    ] ],

    locationReverseGeocode: [ 'get', '/:slug/locations/geocode/reverse', [
      cmn.loadAgenda,
      checkLogging,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.reverseGeocode
    ] ],

    locationResync: [ 'get', '/:slug/admin/locations/resync', [
      cmn.loadAgenda,
      cmn.verifyIPMiddleware,
      mw.resync,
      _resyncSuccess
    ] ],

    locationToVerifyCount: [ 'get', '/:slug/admin/locations/verifycount', [
      cmn.loadAgenda,
      checkLogging,
      cmn.authorize.moderator,
      mw.getUnverifiedCount
    ] ],

    locationNewImageUpload: [ 'post', '/:slug/locations/image', [
      cmn.loadAgenda,
      checkLogging,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.newImageUpload
    ] ],

    locationNewImageRemove: [ 'post', '/:slug/locations/image/remove', [
      cmn.loadAgenda,
      checkLogging,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.newImageRemove
    ] ],

    locationImageUpload: [ 'post', '/:slug/locations/:locationUid/image', [
      cmn.loadAgenda,
      checkLogging,
      cmn.authorize.moderator,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.imageUpload
    ] ],

    locationImageRemove: [ 'post', '/:slug/locations/:locationUid/image/remove', [
      cmn.loadAgenda,
      checkLogging,
      cmn.authorize.moderator,
      cmn.assign( 'req.user.uid', 'req.userUid' ),
      mw.imageRemove
    ] ],

    agendaLocationGet: [ 'get', '/:slug/locations/:locationUid', [
      checkLogging,
      mw.load,
      ( req, res ) => { res.json( req.location ); }
    ] ]

  };

module.exports = function( path ) {

  const router = modLib.Router( routes );

  router.pre( [
    // agenda must not be preloaded as location get must work as transverse
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function show( req, res ) {

  const scriptParams = {
    detailedInfo: req.settings.admin && req.settings.admin.detailed !== undefined ? req.settings.admin.detailed : true,
    settings: req.settings,
    lang: req.lang,
    enableGeocode: true,
    agenda: {
      slug: req.agenda.slug,
      title: req.agenda.title,
      uid: req.agenda.uid
    },
    res: {
      csv: req.genUrl( 'agendaAdminLocationsCsv', { slug: req.agenda.slug } ),
      index: req.genUrl( 'locationIndex', { slug: req.agenda.slug } ),
      geocode: req.genUrl( 'locationGeocode', { slug: req.agenda.slug } ),
      insee: req.genUrl( 'locationINSEE', { slug: req.agenda.slug } ),
      reverseGeocode: req.genUrl( 'locationReverseGeocode', { slug: req.agenda.slug } ),
      seeEvents: req.genUrl( 'agendaAdminShow', { slug: req.agenda.slug } ) + '?locationUid=:locationUid',
      set: req.genUrl( 'agendaAdminLocationSet', { slug: req.agenda.slug } ),
      get: req.genUrl( 'agendaLocationGet', { slug: req.agenda.slug, locationUid: ':locationUid' } ),
      getStakeholder: req.genUrl( 'locationGetStakeholder', { slug: req.agenda.slug, stakeholderId: ':stakeholderId' } ),
      remove: req.genUrl( 'agendaAdminLocationRemove', { slug: req.agenda.slug } ),
      merge: req.genUrl( 'agendaAdminLocationMerge', { slug: req.agenda.slug } ),
      removeSuggestion: req.genUrl( 'locationSuggestionRemove', { slug: req.agenda.slug, locationUid: ':locationUid' } ),
      image: {
        newUpload: req.genUrl( 'locationNewImageUpload', { slug: req.agenda.slug } ),
        newRemove: req.genUrl( 'locationNewImageRemove', { slug: req.agenda.slug } ),
        upload: req.genUrl( 'locationImageUpload', { slug: req.agenda.slug, locationUid: ':locationUid' } ),
        remove: req.genUrl( 'locationImageRemove', { slug: req.agenda.slug, locationUid: ':locationUid' } )
      }
    }
  }

  return res.send( layout( '<div class="js_canvas"></div>', {
    lang: req.lang,
    agenda: req.agenda,
    bodyAttributes: [ {
      name: 'data-options',
      value: JSON.stringify( scriptParams )
    } ],
    scripts: {
      bottom: [ { src: '/js/locationsIndex.js' } ]
    }
  } ) );

}

function forwardCsvExport( req, res, next ) {

  const options = ih( config.scriptRoutes.adminLocationReport, {
    path: {
      $set: config.scriptRoutes.adminLocationReport.path
      .replace( ':agendaUid', req.agenda.uid )
      .replace( ':userUid', req.user.uid )
      + '?lang=' + req.lang
    }
  } );

  http.get( options, response => {

    res.set( _.pick( response.headers, [ 'content-type', 'content-disposition' ] ) );

    response.pipe( res );

  } );

}

function _resyncSuccess( req, res, next ) {

  sessions.setFlash( req, res, 'resync is ongoing' );

  res.redirect( req.genUrl( 'agendaAdminLocations', { slug: req.agenda.slug } ) );

}


function showList( req, res, next ) {

  return res.json( {
    items: req.locations.items,
    total: req.locations.total
  } );

  next();

}


function _checkCreate( req, res, next ) {

  if ( req.body && !req.body.uid && !req.body.id ) {

    return next();

  }

  cmn.authorize.moderator( req, res, next );
}
