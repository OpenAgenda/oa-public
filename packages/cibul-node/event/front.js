"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const deepExtend = require( 'deep-extend' );
const { promisify } = require( 'util' );

const agendaSvc = require( '@openagenda/agendas' );
const getLabel = require( '@openagenda/labels' )( require( '@openagenda/labels/event/show' ) );
const sessions = require( '@openagenda/sessions' );
const stakeholderSvc = require( '@openagenda/agenda-stakeholders' );
const stakeholderMw = require( '@openagenda/agenda-stakeholders/dist/middleware' );

const cmn = require( '../lib/commons-app' );
const config = require( '../config' );
const embedSvc = require( '../services/embed' );
const eventSvc = require( '../services/event' );
const legacyAgendaSvc = require( '../services/agenda' );
const modLib = require( '../lib/moduleLib' );

const middlewares = {
  agendaEventShow: [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.components,
    _formatAgendaLinks( 'agendaShow', [ 'slug' ] ),
    legacyAgendaSvc.mw.decorateEvent( false ),
    _formatSocialLinks,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oasfmain.css' ),
    _appendEventTransferCredential,
    _appendSettings,
    wrap( agendaEventShow )
  ],
  customEmbedEventShow: [
    legacyAgendaSvc.mw.decorateEvent( false ),
    _formatSocialLinks,
    _formatFavoriteLink,
    _addInterfaceLanguage,
    _formatEmbedHeadLinks,
    cmn.useEmbedGoogleAnalytics,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oae.css' ),
    embedSvc.mw.loadCustomLayoutData,
    agendaEmbedEventShow
  ]
};

const routes = {

  agendaEventShowPrivate: [ 'get', '/:slug.prv/events/:eventSlug', [
    cmn.https,
    legacyAgendaSvc.mw.load( 'slug' ),
    cmn.ifIsNot( 'agenda.private', cmn.redirectTo( 'agendaShow', { slug: 'slug', eventSlug: 'eventSlug' }, { maintainQuery: true } ) ),
    sessions.middleware.ifUnlogged( cmn.redirectTo( 'agendaSignin', {
      slug: 'slug',
      msg: {
        $raw: 'limitedAccessEvent'
      },
      redirect: {
        $base64Route: [ 'agendaEventShowPrivate', { slug: 'slug', eventSlug: 'eventSlug' } ]
      }
    } ) ),
    sessions.middleware.load( { detailed: true } ),
    stakeholderMw.agenda().get(),
    cmn.ifIsNot( 'stakeholder', cmn.renderUnauthorized() )
  ].concat( middlewares.agendaEventShow ) ],

  agendaEventShow: [ 'get', '/:slug/events/:eventSlug', [
    cmn.https,
    legacyAgendaSvc.mw.load( 'slug' ),
    cmn.ifIs( 'agenda.private', cmn.redirectTo( 'agendaEventShowPrivate', {
      slug: 'slug',
      eventSlug: 'eventSlug'
    }, { maintainQuery: true } ) ),
    sessions.middleware.load()
  ].concat( middlewares.agendaEventShow ) ],

  agendaEventRedirect: [ 'get', '/agendas/:uid/events/:eventUid', [
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    redirect
  ] ],

  agendaEmbedEventShow: [ 'get', '/agendas/:uid/embed/events/:eventUid', [
    legacyAgendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    eventSvc.mw.components,
    _formatAgendaLinks( 'agendaEmbedShow', [ 'uid' ] ),
    legacyAgendaSvc.mw.decorateEvent( false ),
    _formatSocialLinks,
    _formatEmbedHeadLinks,
    cmn.useEmbedGoogleAnalytics,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oae.css' ),
    _appendFacebookParams,
    agendaEmbedEventShow
  ] ],

  agendaCustomEmbedEventShow: [ 'get', '/agendas/:uid/embeds/:embedUid/events/:eventUid', [
    legacyAgendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    eventSvc.mw.components,
    _formatAgendaLinks( 'customEmbedShow', [ 'uid', 'embedUid' ] ),
  ].concat( middlewares.customEmbedEventShow ) ],

  agendaCustomEmbedEventShowPreview: [ 'get', '/agendas/:uid/previewEmbeds/:embedUid/events/:eventUid', [
    legacyAgendaSvc.mw.load( 'uid' ),
    cmn.checkAdministrator(),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
    eventSvc.mw.format,
    eventSvc.mw.components,
    _formatAgendaLinks( 'customEmbedShowPreview', [ 'uid', 'embedUid' ] )
  ].concat( middlewares.customEmbedEventShow ) ],

  eventShow: [ 'get', '/events/:eventSlug', [
    cmn.https,
    ( req, res, next ) => {

      const integer = parseInt( req.params.eventSlug );

      if ( Number.isInteger( integer ) && ((integer + '').length === req.params.eventSlug.length) ) {

        return next( 'route' );

      }

      next();
    },
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    ( req, res, next ) => {

      if ( req.event.origin ) {
        req.agenda = req.event.origin;
        return redirect( req, res, next );
      }

      next();
    },
    eventSvc.mw.format,
    eventSvc.mw.components,
    _formatSocialLinks,
    cmn.loadBaseData( eventSvc.mw.layoutData, 'oasfmain.css' ),
    show
  ] ],

  eventShowByUid: [ 'get', '/events/:eventUid', [
    cmn.https,
    eventSvc.mw.load( 'eventUid', 'uid' ),
    ( req, res, next ) => {
      req.agenda = req.event.origin;
      next();
    },
    redirect
  ] ]

};

module.exports = path => {

  const router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'event front' ),
    cmn.redirectLegacySearch
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

};


/**
 * controllers
 */

async function agendaEventShow( req, res, next ) {

  const reqParams = {
    slug: req.agenda.slug,
    eventSlug: req.event.slug
  }

  if ( req.query.admin_nav ) {

    reqParams.admin_nav = req.query.admin_nav;

  }

  _addLanguageLinks( req, 'agendaEventShow', reqParams );

  _addContactLink( req );

  const userStakeholder = req.user
    ? await promisify( stakeholderSvc( req.agenda.id ).get )( { userId: req.user.id } )
    : null;

  req.event.getContributor( ( err, contributor ) => {

    if ( err ) return next( err );

    cmn.render( req, res, 'event/show', {
      scriptParams: {
        contributor
      },
      agendaId: req.agenda.id,
      private: req.agenda.private,
      adminNav: req.query.admin_nav,
      event: req.formatted,
      components: req.components,
      userStakeholder,
      user: req.user
    } );
  } )

}

function redirect( req, res, next ) {

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
    eventRender: req.render,
    scriptParams: {
      res: {
        actions: req.genUrl( 'agendaActionShow', { slug: req.agenda.slug } )
      }
    }
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
    backQuery: { uid: req.params.uid, embedUid: req.params.embedUid }
  } );

}


function show( req, res ) {

  _addLanguageLinks( req, 'eventShow', {
    eventSlug: req.params.eventSlug
  } );

  _addContactLink( req );

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

  req.formatted.languages.selection.forEach( function ( lang ) {

    linkedLanguages.push( {
      label: lang,
      link: req.genUrl( uri, _.extend( {}, uriParams, { lang } ) )
    } );

  } );

  req.formatted.languages.selection = linkedLanguages;

}


function _addContactLink( req ) {

  if ( !req.formatted.owner ) return;

  req.formatted.owner.contactLink = req.genUrl( 'conversationDiscussion', {
    uid: req.formatted.owner.uid,
    redirect: new Buffer( req.genUrl( req.agenda ? 'agendaEventShow' : 'eventShow', req.agenda ? {
      slug: req.agenda.slug,
      eventSlug: req.event.slug
    } : { eventSlug: req.event.slug }, { abs: true } ) ).toString( 'base64' )
  } );

}


function _switchEmbedLang( req, res, next ) {

  req.event.switchLanguage( req.lang );

  next();

}


function _formatAgendaLinks( uri, keys ) {

  return function ( req, res, next ) {

    const routeValues = _getRouteValues( req, keys );

    const baseSearchQuery = {};

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

    req.formatted.backLabel = getLabel( 'back', req.lang );

    // link to results for event location in agenda
    req.formatted.locationLink = req.genUrl( uri, [
      routeValues,
      { oaq: _.extend( { location: req.event.getLocationUid() }, baseSearchQuery ) },
      { lang: req.lang }
    ] );

    req.formatted.googleItineraryLink = _googleItineraryLink( req.event.getLatitude(), req.event.getLongitude() );

    // link to results for same category in agenda
    req.formatted.categoryLink = false;

    if ( req.formatted.categorySlug ) {

      req.formatted.categoryLink = req.genUrl( uri, [
        routeValues,
        { oaq: _.extend( { category: req.formatted.categorySlug }, baseSearchQuery ) },
        { lang: req.lang }
      ] );

    }

    next();

  }

}

function _getRouteValues( req, keys ) {

  const routeValues = [];

  if ( typeof keys == 'string' ) keys = [ keys ];

  keys.forEach( function ( k ) {

    routeValues[ k ] = req.params[ k ];

  } );

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
  } );

  req.formatted.googleItineraryLink = _googleItineraryLink( req.event.getLatitude(), req.event.getLongitude() );

  req.formatted.categoryLink = false;

  if ( req.formatted.categorySlug ) {

    req.formatted.categoryLink = req.genUrl( 'agendaEmbedShow', {
      uid: req.params.uid,
      oaq: {
        category: req.formatted.categorySlug
      }
    } );

  }

  req.formatted.backLabel = getLabel( 'back', req.lang );

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
  } );

  req.formatted.googleItineraryLink = _googleItineraryLink( req.event.getLatitude(), req.event.getLongitude() );

  req.formatted.categoryLink = false;

  if ( req.formatted.categorySlug ) {

    req.formatted.categoryLink = req.genUrl( 'customEmbedShow', {
      uid: req.params.uid,
      embedUid: req.params.embedUid,
      oaq: {
        category: req.formatted.categorySlug
      },
      lang: req.lang
    } );

  }

  req.formatted.backLabel = getLabel( 'back', req.lang );

  next();

}


function _appendEventTransferCredential( req, res, next ) {

  req.baseData.hasOwnershipTransfer = false;

  req.baseData.scriptParams.hasOwnershipTransfer = false;

  req.agenda.hasCredential( 'eventTransfer', ( err, has ) => {

    req.baseData.hasOwnershipTransfer = has;

    req.baseData.scriptParams.hasOwnershipTransfer = has;

    next();

  } );

}


function _appendSettings( req, res, next ) {

  if ( !req.agenda ) return next();

  agendaSvc.get( { uid: req.agenda.uid }, { private: null, internal: true }, ( err, agenda ) => {

    if ( err ) return next( err );

    req.baseData = ih( req.baseData, { 
      indexed: { 
        $set: _.get( agenda, 'indexed', true ) && !_.get( agenda, 'private', false )  
      },
      scriptParams: {
        moderatorCanPublish: {
          $set: _.get( agenda, 'settings.contribution.canPublish', [ 'moderators', 'administrators' ] ).includes( 'moderators' )
        }
      },
      mailto: {
        $set: cmn.agendaMailTo( agenda )
      },
      useContributeApp: {
        $set: _.get( agenda, 'credentials.useContributeApp', false )
      }
    } );

    next();

  } );

}


function _formatFavoriteLink( req, res, next ) {

  req.formatted.favorite = cmn.favoriteLinkHTML( req.event.uid );

  next();

}

function _addInterfaceLanguage( req, res, next ) {

  req.formatted.interfaceLang = req.lang;

  next();

}


function _formatSocialLinks( req, res, next ) {

  let siteUrl = false,

    eventUrl,

    fbAppId,

    externalSite = false;

  if ( req.agenda ) {

    eventUrl = req.genUrl( 'agendaEventShow', {
      slug: req.agenda.slug,
      eventSlug: req.event.slug
    }, { protocol: 'https://' } );

    siteUrl = req.genUrl( 'agendaShow', {
      slug: req.agenda.slug
    }, { protocol: 'https://' } );

  } else {

    eventUrl = req.genUrl( 'eventShow', {
      eventSlug: req.event.slug
    }, { protocol: 'https://' } );

  }

  if ( req.embed ) {

    if ( req.embed.getSiteUrl() ) {

      externalSite = true;

      siteUrl = req.embed.getSiteUrl();

      eventUrl = siteUrl + '?oaq[uid]=' + req.event.uid;

    }

    fbAppId = req.embed.getFacebookAppId();

  }

  deepExtend( req.formatted, eventSvc.share.getSocialLinks( req.event, eventUrl, siteUrl ) );

  if ( fbAppId ) {

    req.formatted.facebookShare = eventSvc.share.getFacebookFeedLink( req.formatted, eventUrl, fbAppId );

  }

  next();

}


function _formatEmbedHeadLinks( req, res, next ) {

  req.formatted.actionLink = req.genUrl( 'agendaEventActionShow', {
    slug: req.agenda.slug,
    eventSlug: req.event.slug
  }, { protocol: 'https://' } );


  req.formatted.actionLabel = getLabel( 'export', req.lang );

  next();

}

function _googleItineraryLink( lat, lng ) {

  return `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},17z`;

}

function _googleMapsLink( lat, lng ) {

  return `https://maps.google.com/maps?q=${lat},${lng}&z=15`

}

function wrap( fn ) {

  return ( req, res, next ) => fn( req, res, next ).catch( next );

}
