"use strict";

const _ = require( 'lodash' );
const http = require( 'http' );
const ih = require( 'immutability-helper' );


const mw = require( '@openagenda/agenda-locations' ).mw();
const sessions = require( '@openagenda/sessions' );

const layout = require( '../services/lib/layouts' ).load(
  'agendaAdmin', { selectedTab: 'locations' }
);
const cmn = require( '../lib/commons-app' );
const config = require( '../config' );

const checkLogging = sessions.middleware.ifUnlogged( cmn.redirectTo( 'agendaSignup', { slug: 'slug' } ) );


module.exports = app => {

  app.get(
    '/:slug/locations',
    cmn.loadAgenda,
    checkLogging,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.list,
    showList
  );

  app.get(
    '/:slug/admin/locations',
    cmn.loadAgenda,
    checkLogging,
    cmn.verifyIPMiddleware,
    cmn.authorize.moderator,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.loadSettings(),
    show
  );

  app.get(
    '/:slug/admin/locations/exports.csv',
    cmn.loadAgenda,
    checkLogging,
    cmn.verifyIPMiddleware,
    cmn.authorize.moderator,
    forwardCsvExport
  );

  app.post(
    '/:slug/locations',
    cmn.loadAgenda,
    checkLogging,
    _checkCreate,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.setToValidate
  );

  app.post(
    '/:slug/admin/locations',
    cmn.loadAgenda,
    checkLogging,
    cmn.verifyIPMiddleware,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.set
  );

  app.post(
    '/:slug/admin/locations/remove',
    cmn.loadAgenda,
    checkLogging,
    cmn.verifyIPMiddleware,
    cmn.authorize.moderator,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.remove
  );

  app.post(
    '/:slug/admin/locations/merge',
    cmn.loadAgenda,
    checkLogging,
    cmn.verifyIPMiddleware,
    cmn.authorize.moderator,
    mw.merge
  );

  app.get(
    '/:slug/admin/locations/terms',
    cmn.loadAgenda,
    checkLogging,
    cmn.verifyIPMiddleware,
    cmn.authorize.moderator,
    mw.list.terms
  );

  app.get(
    '/:slug/admin/locations/stakeholders/:stakeholderId',
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
  );

  app.get(
    '/:slug/locations/geocode',
    cmn.loadAgenda,
    checkLogging,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.geocode
  );

  app.get(
    '/:slug/locations/insee',
    cmn.loadAgenda,
    checkLogging,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.insee
  );

  app.get(
    '/:slug/locations/geocode/reverse',
    cmn.loadAgenda,
    checkLogging,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.reverseGeocode
  );

  app.get(
    '/:slug/admin/locations/resync',
    cmn.loadAgenda,
    cmn.verifyIPMiddleware,
    mw.resync,
    _resyncSuccess
  );

  app.get(
    '/:slug/admin/locations/verifycount',
    cmn.loadAgenda,
    checkLogging,
    cmn.authorize.moderator,
    mw.getUnverifiedCount
  );

  app.post(
    '/:slug/locations/image',
    cmn.loadAgenda,
    checkLogging,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.newImageUpload
  );

  app.post(
    '/:slug/locations/image/remove',
    cmn.loadAgenda,
    checkLogging,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.newImageRemove
  );

  app.post(
    '/:slug/locations/:locationUid/image',
    cmn.loadAgenda,
    checkLogging,
    cmn.authorize.moderator,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.imageUpload
  );

  app.post(
    '/:slug/locations/:locationUid/image/remove',
    cmn.loadAgenda,
    checkLogging,
    cmn.authorize.moderator,
    cmn.assign( 'req.user.uid', 'req.userUid' ),
    mw.imageRemove
  );

  app.get(
    '/:slug/locations/:locationUid',
    checkLogging,
    mw.load,
    ( req, res ) => { res.json( req.location ); }
  );

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
      getStakeholder: req.genUrl(
        'locationGetStakeholder',
        { slug: req.agenda.slug, stakeholderId: ':stakeholderId' }
      ),
      remove: req.genUrl( 'agendaAdminLocationRemove', { slug: req.agenda.slug } ),
      merge: req.genUrl( 'agendaAdminLocationMerge', { slug: req.agenda.slug } ),
      removeSuggestion: req.genUrl(
        'locationSuggestionRemove',
        { slug: req.agenda.slug, locationUid: ':locationUid' }
      ),
      image: {
        newUpload: req.genUrl( 'locationNewImageUpload', { slug: req.agenda.slug } ),
        newRemove: req.genUrl( 'locationNewImageRemove', { slug: req.agenda.slug } ),
        upload: req.genUrl( 'locationImageUpload', { slug: req.agenda.slug, locationUid: ':locationUid' } ),
        remove: req.genUrl( 'locationImageRemove', { slug: req.agenda.slug, locationUid: ':locationUid' } )
      }
    }
  }

  return res.send( layout( '<div class="js_canvas"></div>', {
    role: req.role,
    lang: req.lang,
    agenda: req.agenda,
    bodyAttributes: [
      {
        name: 'data-options',
        value: JSON.stringify( scriptParams )
      }
    ],
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
