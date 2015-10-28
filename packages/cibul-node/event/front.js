"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

utils = require( 'utils' ),

agendaSvc = require( '../services/agenda' ),

embedSvc = require( '../services/embed/embed' ),

eventSvc = require( '../services/event' ),

i18n = require( '../i18n/i18n' ),

routes = {

  agendaEventShow: [ 'get', '/:slug/events/:eventSlug', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    _formatAgendaLinks( 'agendaShow', [ 'slug' ] ),
    agendaSvc.mw.decorateEvent( false ),
    _formatSocialLinks,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oa.css' ),
    _appendEventTransferCredential,
    agendaEventShow
  ] ],

  agendaEventRedirect: [ 'get', '/agendas/:uid/events/:eventUid', [
    agendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    redirect
  ]],

  agendaEmbedEventShow: [ 'get', '/agendas/:uid/embed/events/:eventUid', [
    agendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    _formatAgendaLinks( 'agendaEmbedShow', [ 'uid' ] ),
    _formatSocialLinks,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oae.css' ),
    _appendFacebookParams,
    agendaEmbedEventShow
  ] ],

  agendaCustomEmbedEventShow: [ 'get', '/agendas/:uid/embeds/:embedUid/events/:eventUid', [
    agendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    _formatAgendaLinks( 'customEmbedShow', [ 'uid', 'embedUid' ] ),
    _formatSocialLinks,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oae.css' ),
    embedSvc.mw.loadCustomLayoutData,
    agendaEmbedEventShow 
  ] ],

  agendaCustomEmbedEventShowPreview: [ 'get', '/agendas/:uid/previewEmbeds/:embedUid/events/:eventUid', [
    agendaSvc.mw.load( 'uid' ),
    cmn.checkAdministrator(),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    _formatAgendaLinks( 'customEmbedShowPreview', [ 'uid', 'embedUid' ] ),
    _formatSocialLinks,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oae.css' ),
    embedSvc.mw.loadCustomLayoutData,
    agendaEmbedEventShow 
  ]],

  eventShow: [ 'get', '/events/:eventSlug', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    _formatSocialLinks,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oa.css' ),
    show
  ] ]

},

deepExtend = require( 'deep-extend' );

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'event front' ),
    cmn.redirectLegacySearch,
    cmn.flashSetter,
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

};


/**
 * controllers
 */

function agendaEventShow( req, res ) {

  _addLanguageLinks( req, 'agendaEventShow', {
    slug: req.params.slug,
    eventSlug: req.params.eventSlug
  } );

  cmn.render( req, res, 'event/show', {
    event: req.formatted
  } );

}

function redirect( req, res ) {

  if ( !req.agenda || !req.event ) return next( { code: 404 } );

  res.redirect( 301, req.genUrl( 'agendaEventShow', {
    slug: req.agenda.slug, 
    eventSlug: req.event.slug
  }, {
    protocol: 'https://'
  } ) );

}


function agendaEmbedEventShow( req, res ) {

  cmn.render( req, res, 'event/embedShow', {
    eventRender: req.render
  } );

}


function agendaCustomEmbedEventShow( req, res ) {

  _addLanguageLinks( req, 'agendaCustomEmbedEventShow', {
    uid: req.params.uid,
    embedUid: req.params.embedUid,
    eventUid: req.params.eventUid
  } );

  // back link needs to

  cmn.render( req, res, 'event/embedShow', { 
    event: req.formatted, 
    backUri: 'customEmbedShow',
    backQuery: { uid: req.params.uid, embedUid: req.params.embedUid }
  } );

}


function show( req, res ) {

  _addLanguageLinks( req, 'eventShow', {
    eventSlug: req.params.eventSlug
  } );

  cmn.render( req, res, 'event/show', { event: req.formatted } );

}


function _appendFacebookParams( req, res, next ) {

  if ( !req.query.fb ) return next();

  // to add 'fb' class to layout html
  req.baseData.facebook = true;

  req.baseData.scriptParams.facebook = true;

  req.baseData.scriptParams.fbAppId = config.auth.facebook.id;

  next();

}


function _addLanguageLinks( req, uri, uriParams ) {

  var linkedLanguages = [];

  if ( !req.formatted.languages ) return;

  req.formatted.languages.selection.forEach( function( lang ) {

    linkedLanguages.push({
      label: lang,
      link: req.genUrl( uri, utils.extend( {}, uriParams, { lang: lang } ) )
    });

  });

  req.formatted.languages.selection = linkedLanguages;

}



function _switchEmbedLang( req, res, next ) {

  req.event.switchLanguage( req.lang );

  next();

}


function _formatAgendaLinks( uri, keys ) {

  return function( req, res, next ) {

    var routeValues = _getRouteValues( req, keys ),

    baseSearchQuery = {};

    if ( req.query.fb ) routeValues.fb = 1;

    if ( req.query.oaq && req.query.oaq.passed !== undefined ) {

      baseSearchQuery.passed = req.query.oaq.passed;

    }

    // link to go back to the agenda
    req.formatted.backLink = req.genUrl( uri, [ 
      routeValues, 
      req.query.oaq ? { oaq: req.query.oaq } : {},
      { lang: req.lang }
    ] );

    req.formatted.backLabel = i18n( 'back', req.lang );

    // link to results for event location in agenda
    req.formatted.locationLink = req.genUrl( uri, [
      routeValues,
      { oaq: utils.extend( { location: req.event.getLocationUid() }, baseSearchQuery ) },
      { lang: req.lang }
    ] );

    // link to results for same category in agenda
    req.formatted.categoryLink = false;

    if ( req.formatted.categorySlug ) {

      req.formatted.categoryLink = req.genUrl( uri, [
        routeValues,
        { oaq: utils.extend( { category: req.formatted.categorySlug }, baseSearchQuery ) },
        { lang: req.lang }
      ] );

    }

    next();

  }

}

function _getRouteValues( req, keys ) {

  var routeValues = [];

  if ( typeof keys == 'string' ) keys = [ keys ];

  keys.forEach( function( k ) {

    routeValues[ k ] = req.params[ k ];

  });

  return routeValues;

}


/**
 * append 'back to agenda' link and event social share links to event data
 */

function _formatEmbedLinks( req, res, next ) {

  req.formatted.backLink = req.genUrl( 'agendaEmbedShow', {
    uid: req.params.uid,
    lang: req.lang
  } );

  req.formatted.locationLink = req.genUrl( 'agendaEmbedShow', {
    uid: req.params.uid,
    oaq: {
      location: req.event.getLocationUid()
    },
    lang: req.lang
  });

  req.formatted.categoryLink = false;

  if ( req.formatted.categorySlug ) {

    req.formatted.categoryLink = req.genUrl( 'agendaEmbedShow', {
      uid: req.params.uid,
      oaq: {
        category: req.formatted.categorySlug
      }
    });

  }

  req.formatted.backLabel = i18n( 'back', req.lang );

  next();

}


/**
 * append 'back to agenda' link and event social share links to event data
 */

function _formatCustomEmbedLinks( req, res, next ) {

  req.formatted.backLink = req.genUrl( 'customEmbedShow', { 
    uid: req.params.uid, 
    embedUid: req.params.embedUid,
    lang: req.lang
  } );

  req.formatted.locationLink = req.genUrl( 'customEmbedShow', {
    uid: req.params.uid,
    embedUid: req.params.embedUid,
    oaq: {
      location: req.event.getLocationUid()
    },
    lang: req.lang
  });

  req.formatted.categoryLink = false;

  if ( req.formatted.categorySlug ) {

    req.formatted.categoryLink = req.genUrl( 'customEmbedShow', {
      uid: req.params.uid,
      embedUid: req.params.embedUid,
      oaq: {
        category: req.formatted.categorySlug
      },
      lang: req.lang
    });

  }

  req.formatted.backLabel = i18n( 'back', req.lang );

  next();

}


function _appendEventTransferCredential( req, res, next ) {

  req.baseData.hasOwnershipTransfer = false;

  req.baseData.scriptParams.hasOwnershipTransfer = false;

  if ( !req.session ) return next();

  if ( req.session.userId !== req.event.ownerId ) return next();

  req.agenda.hasCredential( 'eventTransfer', ( err, has ) => {

    req.baseData.hasOwnershipTransfer = has;

    req.baseData.scriptParams.hasOwnershipTransfer = has;

    next();

  } );

}


function _formatSocialLinks( req, res, next ) {

  var siteUrl = false, eventUrl, fbAppId;

  if ( req.agenda ) {

    eventUrl = req.genUrl( 'agendaEventShow', {
      slug: req.agenda.slug,
      eventSlug: req.event.slug 
    }, { protocol: 'https://' } );

  } else {

    eventUrl = req.genUrl( 'eventShow', {
      eventSlug: req.event.slug 
    }, { protocol: 'https://' } );

  }

  if ( req.embed ) {

    siteUrl = req.embed.getSiteUrl();

    eventUrl = siteUrl + '?oaq[uid]=' + req.event.uid;

    fbAppId = req.embed.getFacebookAppId();

  }

  deepExtend( req.formatted, eventSvc.share.getSocialLinks( req.event, eventUrl, siteUrl ) );

  if ( fbAppId ) {

    req.formatted.facebookShare = eventSvc.share.getFacebookFeedLink( req.formatted, eventUrl, fbAppId );

  }

  next();

}