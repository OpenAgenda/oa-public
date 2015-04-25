"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

agendaSvc = require( '../services/agenda/agenda' ),

embedSvc = require( '../services/embed/embed' ),

eventSvc = require( '../services/event/event' ),

timeHelper = require( 'cibulTemplates' ).helpers.time,

textHelper = require( 'cibulTemplates' ).helpers.text(),

i18n = require( '../i18n/i18n' ),

routes = {

  agendaEventShow: [ 'get', '/:slug/events/:eventSlug', [
    cmn.loadAgenda( 'slug' ), 
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.loadAgendaEvent( 'eventSlug', 'slug' ),
    _format,
    _formatSocialLinks,
    cmn.loadBaseData( _layoutData, 'oa.css' ),
    agendaEventShow
  ] ],

  agendaEmbedEventShow: [ 'get', '/agendas/:uid/embed/events/:eventUid', [
    agendaSvc.mw.load( 'uid' ),
    eventSvc.mw.loadAgendaEvent( 'eventUid', 'uid' ),
    _format,
    _formatEmbedLinks,
    _formatSocialLinks,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( _layoutData, 'oae.css' ),
    agendaEmbedEventShow
  ] ],

  agendaCustomEmbedEventShow: [ 'get', '/agendas/:uid/embeds/:embedUid/events/:eventUid', [
    agendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    eventSvc.mw.loadAgendaEvent( 'eventUid', 'uid' ),
    _format,
    _formatCustomEmbedLinks,
    _formatSocialLinks,
    embedSvc.mw.renderEvent,
    cmn.loadBaseData( _layoutData, 'oae.css' ),
    embedSvc.mw.loadCustomLayoutData,
    agendaEmbedEventShow 
  ] ],

  eventShow: [ 'get', '/events/:eventSlug', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _format,
    _formatSocialLinks,
    cmn.loadBaseData( _layoutData, 'oa.css' ),
    show
  ] ],
  
  eventActionShow: [ 'get', '/events/:eventSlug/action', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _format,
    _loadUris,
    _extractAgendasSharing,
    _conditionalLayout( _layoutData, 'oa.css' ),
    actionShow
  ] ],
  
  eventActionDatesShow: [ 'get', '/events/:eventSlug/action/dates', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _format,
    _loadUris,
    _conditionalLayout( _layoutData, 'oa.css' ),
    actionDatesShow
  ] ]

},

log = require( '../lib/logger' )( 'event front' ),

async = require( 'async' ),

config = require( '../config' ),

model = cmn.getCibulModel(),

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
  
  cmn.render( req, res, 'event/show', { event: req.formatted } );

}


function agendaEmbedEventShow( req, res ) {

  // backUri: 'embedShow',
  // backQuery: { uid: req.params.uid }
  // 

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


function actionShow( req, res ) {

  var templateData = {
    event: {
      uid: req.event.uid,
      title: req.event.getTitle(),
      imports: [],
      uri: req.eventUri,
      params: req.eventUriParams
    },
    logged: req.session.logged,
    agendas: []
  },

  timings = req.event.getTimings(),

  multipleTimings = timings.length > 1;

  eventSvc.share.addCalendarLinks( req.event, req.genUrl( req.eventUri, req.eventUriParams, { abs: true } ) );

  templateData.event.imports = [
    { 
      label: 'Google Calendar',
      uri: multipleTimings ? req.genUrl( 'eventActionDatesShow', [ req.eventUriParams, { service: 'google' } ] ) : timings[ 0 ].calendarLinks.google,

    },
    { 
      label: 'Yahoo! Calendar',
      uri: multipleTimings ? req.genUrl( 'eventActionDatesShow', [ req.eventUriParams, { service: 'yahoo' } ] ) : timings[ 0 ].calendarLinks.yahoo,
    },
    { 
      label: 'Windows Live',
      uri: multipleTimings ? req.genUrl( 'eventActionDatesShow', [ req.eventUriParams, { service: 'live' } ] ) : timings[ 0 ].calendarLinks.live
    }
  ];

  templateData.event.multipleTimings = multipleTimings;

  if ( !req.session.logged ) return cmn.render( req, res, 'event/action', templateData );

  model.reviews().list( { stakeholderId: req.user.id }, function( err, agendas ) {

    if ( err ) return cmn.catchError( req, res )( err );

    templateData.agendas = agendas.map( function( a ) {

      return {
        uid: a.uid,
        slug: a.slug,
        title: a.title,
        sharing: req.agendasSharing.indexOf( a.id ) !== -1
      };

    });

    return cmn.render( req, res, 'event/action', templateData );

  } );

}


function actionDatesShow( req, res ) {

  var service = [ 'google', 'yahoo', 'live' ].indexOf( req.query.service ) !== -1 ? req.query.service : 'google';

  eventSvc.share.addCalendarLinks( req.event, req.genUrl( req.eventUri, req.eventUriParams, { abs: true } ) );

  return cmn.render( req, res, 'event/actionDates', {
    event: {
      uri: req.eventUri,
      params: req.eventUriParams,
      timings: req.event.locations[0].timings.map( function( timing ) {

        return {
          date: timing.date,
          start: timing.start,
          link: timing.calendarLinks[ service ]
        }

      })
    }
  });

}


function _addLanguageLinks( req, uri, uriParams ) {

  var linkedLanguages = [];

  if ( !req.formatted.languages ) return;

  req.formatted.languages.selection.forEach( function( lang ) {

    linkedLanguages.push({
      label: lang,
      link: req.genUrl( uri, lib.extend( {}, uriParams, { elang: lang } ) )
    });

  });

  req.formatted.languages.selection = linkedLanguages;

}



/**
 * prepare event data fitting template requirements
 */

function _format( req, res, next ) {

  var formatted = {}, 

  img = req.event.getImage( true ),

  dateRange = req.event.getDateRange( true ),

  _t = timeHelper( { lang: req.lang } ),

  location;

  async.series([
    req.event.getOwner,
    req.event.getAgendaReferences,
    req.event.getAdminAgendas
  ], function( err, results ) {

    if ( err ) return next( err );

    formatted = {
      uid: req.event.uid,
      slug: req.event.slug,
      title: req.event.getTitle(),
      image: img ? img.replace( 'cibuldev', 'cibul' ) : false,
      dateRange: i18n( dateRange[ 0 ], _t( dateRange[1] ), req.lang ).replace( ':', req.lang=='fr' ? 'h' : ':' ),
      isUpcoming: req.event.isUpcoming(),
      description: req.event.getDescription(),
      freeText: textHelper.nl2br( req.event.getEnrichedFreeText() ),
      tags: req.event.getTags(),
      placeName: false,
      address: false,
      latitude: false,
      longitude: false,
      timings: [],
      pricingInfo: req.event.getPricingInfo(),
      ticketLink: req.event.getTicketLink(),
      owner: results[ 0 ],
      agendaReferences: results[ 1 ],
      adminAgendas: results[ 2 ],
      languages: false
    };


    if ( req.event.locations.length ) {

      location = req.event.locations[ 0 ];

      deepExtend( formatted, {
        placeName: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        timings: location.timings,
        region: location.region,
        city: location.city,
        postalCode: location.postcode,
        ticketLink: false
      } );
      
    }

    if ( req.event.getLanguages().length > 1 ) {

      formatted.languages = {
        current: req.event.getCurrentLanguage(),
        selection: req.event.getLanguages()
      };

    }

    formatted.timings.forEach( function( timing ) {

      timing.label = _t( timing.start, 'dddd Do - HH:mm' );

    });

    formatted.importUri = req.genUrl( 'eventActionShow', { eventSlug: req.event.slug } );

    req.formatted = formatted;

    next();

  } );

}


/**
 * append 'back to agenda' link and event social share links to event data
 */

function _formatEmbedLinks( req, res, next ) {

  req.formatted.backLink = req.genUrl( 'embedShow', {
    uid: req.params.uid
  } );

  req.formatted.backLabel = i18n( 'back', req.lang );

  next();

}


/**
 * append 'back to agenda' link and event social share links to event data
 */

function _formatCustomEmbedLinks( req, res, next ) {

  req.formatted.backLink = req.genUrl( 'customEmbedShow', { 
    uid: req.params.uid, 
    embedUid: req.params.embedUid
  } );

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





function _conditionalLayout( func, css ) {

  return function( req, res, next ) {

    if ( req.xhr ) return next();

    cmn.loadBaseData( func, css )( req, res, next );

  }

} 


function _loadUris( req, res, next ) {

  req.eventUri = req.agenda ? 'agendaEventShow' : 'eventShow';

  req.eventUriParams = { eventSlug: req.event.slug };

  if ( req.agenda ) {

    req.eventUriParams.slug = req.agenda.slug;

  }

  next();

}


/**
 * load agendas sharing the event
 */
function _extractAgendasSharing( req, res, next ) {

  req.agendasSharing = req.event.articles.filter( function( a ) {

    return a.isPublished;

  } ).map( function( a ) {

    return a.review.id;

  });

  next();

}


function _layoutData( req, res ) {

  var data = {
    metas: {
      title: req.formatted.title,
      ogSiteName: { property: 'og:site_name', content: 'OpenAgenda' },
      ogTitle: { property: 'og:title', content: req.formatted.title },
      ogDescription: { property: 'og:description', content: req.formatted.description },
      ogLocale: { property: 'og:locale', content: req.lang },
      "twitter:card" : "summary_large_image",
      "twitter:title" : req.formatted.title,
      "twitter:description" : req.formatted.description,
      "twitter:domain" : config.domain
    },
    loner: !req.agenda
  },

  uri = req.agenda ? 'agendaEventShow' : 'eventShow',

  uriParams = { eventSlug: req.event.slug };

  if ( req.agenda ) {

    uriParams.slug = req.agenda.slug;

    lib.extend( data, {
      uid: req.agenda.uid,
      slug: req.agenda.slug,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( false ),
      theme: req.agenda.getTheme()
    });

  }

  if ( !data.headLinks ) data.headLinks = [];
  
  if ( req.event.getLanguages && req.event.getLanguages().length > 1 ) {

    req.event.getLanguages().forEach( function( lang ) {

      data.headLinks.push({ rel: 'alternate', href: req.genUrl( uri, lib.extend( { elang: lang }, uriParams ), { abs: true } ), hreflang: lang });

    });

  }

  data.headLinks.push({
    rel: 'canonical',
    href: req.genUrl( 'eventShow', { eventSlug: req.event.slug }, { abs: true, protocol: 'https://' } )
  });

  if ( req.event.image ) {

    lib.extend( data.metas, {
      ogImage: { property: 'og:image', content: req.event.image},
      "twitter:image:src" : req.event.image
    });

  }

  data.metas.ogUrl = {
    property: 'og:url',
    content: req.genUrl( uri, uriParams, { abs: true } )
  };

  data.scriptParams = {
    ownerUid: req.formatted.owner.uid,
    adminAgendaUids: req.formatted.adminAgendas ? req.formatted.adminAgendas.map( function( a ) { return a.uid; } ) : []
  };

  return data;

}