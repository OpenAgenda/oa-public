"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

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
    agendaSvc.mw.decorateEvent( false ),
    _formatSocialLinks,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oa.css' ),
    _log,
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
    _formatEmbedLinks,
    _formatSocialLinks,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oae.css' ),
    agendaEmbedEventShow
  ] ],

  agendaCustomEmbedEventShow: [ 'get', '/agendas/:uid/embeds/:embedUid/events/:eventUid', [
    agendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    _formatCustomEmbedLinks,
    _formatSocialLinks,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oae.css' ),
    embedSvc.mw.loadCustomLayoutData,
    agendaEmbedEventShow 
  ] ],

  eventShow: [ 'get', '/events/:eventSlug', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    _formatSocialLinks,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oa.css' ),
    show
  ] ]

},

log = require( '../lib/logger' )( 'event front' ),

deepExtend = require( 'deep-extend' );

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

};


/**
 * controllers
 */

function agendaEventShow( req, res ) {

  _addLanguageLinks( req, 'agendaEventShow', {
    slug: req.params.slug,
    eventSlug: req.params.eventSlug
  } );

  req.event.getFeatured( function( err, featured ) {

    if ( err ) return next( err );

    req.formatted.featured = featured;

    cmn.render( req, res, 'event/show', {
      event: req.formatted
    } );

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


function _addLanguageLinks( req, uri, uriParams ) {

  var linkedLanguages = [];

  if ( !req.formatted.languages ) return;

  req.formatted.languages.selection.forEach( function( lang ) {

    linkedLanguages.push({
      label: lang,
      link: req.genUrl( uri, utils.extend( {}, uriParams, { elang: lang } ) )
    });

  });

  req.formatted.languages.selection = linkedLanguages;

}



function _switchEmbedLang( req, res, next ) {

  req.event.switchLanguage( req.lang );

  next();

}





/**
 * append 'back to agenda' link and event social share links to event data
 */

function _formatEmbedLinks( req, res, next ) {

  req.formatted.backLink = req.genUrl( 'embedShow', {
    uid: req.params.uid
  } );

  req.formatted.locationLink = req.genUrl( 'embedShow', {
    uid: req.params.uid,
    search: {
      location: req.event.getLocationName().slug
    }
  });

  req.formatted.categoryLink = false;

  if ( req.formatted.categorySlug ) {

    req.formatted.categoryLink = req.genUrl( 'embedShow', {
      uid: req.params.uid,
      search: {
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
    search: {
      location: req.event.getLocationUid()
    },
    lang: req.lang
  });

  req.formatted.categoryLink = false;

  if ( req.formatted.categorySlug ) {

    req.formatted.categoryLink = req.genUrl( 'customEmbedShow', {
      uid: req.params.uid,
      embedUid: req.params.embedUid,
      search: {
        category: req.formatted.categorySlug
      },
      lang: req.lang
    });

  }

  req.formatted.backLabel = i18n( 'back', req.lang );

  next();

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

    eventUrl = siteUrl + '?search[uid]=' + req.event.uid;

    fbAppId = req.embed.getFacebookAppId();

  }

  deepExtend( req.formatted, eventSvc.share.getSocialLinks( req.event, eventUrl, siteUrl ) );

  if ( fbAppId ) {

    req.formatted.facebookShare = eventSvc.share.getFacebookFeedLink( req.formatted, eventUrl, fbAppId );

  }

  next();

}

function _log( req, res, next ) {

  console.log( JSON.stringify( req.formatted.custom ) );

  next();

}