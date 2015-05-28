"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

agendaSvc = require( '../services/agenda/agenda' ),

embedSvc = require( '../services/embed/embed' ),

eventSvc = require( '../services/event' ),

mailer = require( '../services/mailer' ),

model = require( '../services/model' ),

timeHelper = require( 'cibulTemplates' ).helpers.time,

textHelper = require( 'cibulTemplates' ).helpers.text(),

i18n = require( '../i18n/i18n' ),

routes = {

  agendaEventShow: [ 'get', '/:slug/events/:eventSlug', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _format,
    _formatSocialLinks,
    cmn.loadBaseData( _layoutData, 'oa.css' ),
    agendaEventShow
  ] ],

  agendaEmbedEventShow: [ 'get', '/agendas/:uid/embed/events/:eventUid', [
    agendaSvc.mw.load( 'uid' ),
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
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
    eventSvc.mw.load( 'eventUid', 'uid' ),
    _switchEmbedLang,
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
  ] ],

  agendaEventActionShow: [ 'get', '/:slug/events/:eventSlug/action', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _format,
    _loadUris,
    _extractAgendasSharing,
    _conditionalLayout( _layoutData, 'oa.css' ),
    actionShow
  ]],

  agendaEventActionDatesShow: [ 'get', '/:slug/events/:eventSlug/action/dates', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _format,
    _loadUris,
    _conditionalLayout( _layoutData, 'oa.css' ),
    actionDatesShow
  ] ],

  agendaEventMailSend: [ 'post', '/:slug/events/:eventSlug/email', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _format,
    _loadUris,
    eventMailSend
  ] ],

  eventMailSend: [ 'post', '/events/:eventSlug/email', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    _format,
    _loadUris,
    eventMailSend
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

  req.event.getFeatured( function( err, featured ) {

    if ( err ) return next( err );

    req.formatted.featured = featured;

    cmn.render( req, res, 'event/show', {
      event: req.formatted
    } );

  } );

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


function actionShow( req, res ) {

  var templateData = {
    mailSendUri: req.genUrl( 'eventMailSend', { eventSlug: req.event.slug } ),
    event: {
      uid: req.event.uid,
      title: req.event.getTitle(),
      imports: [],
      uri: req.eventUri,
      params: req.eventUriParams
    },
    agenda: req.agenda ? req.agenda : false,
    logged: req.session.logged,
    agendas: []
  },

  timings = req.event.getTimings(),

  multipleTimings = timings.length > 1;

  eventSvc.share.addCalendarLinks( req.event, req.genUrl( req.eventUri, req.eventUriParams, { abs: true } ) );

  templateData.event.imports = timings.length ? [
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
  ] : [];

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


function eventMailSend( req, res, next ) {

  var emails = mailer.extractEmails( req.body.mailsend );

  req.formatted.uri = req.eventUri;
  req.formatted.uriParams = req.eventUriParams;

  model.unsubscribed().filter( emails, function( err, emails ) {

    log( 'will send event as email to %s', emails.join(', ') );

    var renders = {};

    async.each( [ 'html', 'text' ], function( type, ecb ) {

      cmn.renderTemplate( req, 'event/email', { 
        type: type,
        layout: {
          title: req.event.getTitle(),
          preheaderContent: req.event.getTitle()
        },
        event: req.formatted,
        agenda: req.agenda ? req.agenda : false,
        map: {
          name: req.formatted.placeName,
          lat: req.formatted.latitude,
          lng: req.formatted.longitude,
          zoom: 16,
          accessToken: config.mapboxAccessToken
        }
      }, function( err, render ) {

        if ( err ) return ecb( err );

        renders[ type ] = render;

        ecb();

      } );

    }, function( err ) {

      if ( err ) next( err );

      // here we send the mail.

      mailer.queueMail( {
        recipient: emails,
        subject: req.event.getTitle(),
        text: renders.text,
        html: renders.html
      } );

      res.setFlash( req, 'The event is being sent to %count% emails', { '%count%' : emails.length } );
      
      res.redirect( 302, req.genUrl( req.eventUri, req.eventUriParams ) );

    } );

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



function _switchEmbedLang( req, res, next ) {

  req.event.switchLanguage( req.lang );

  next();

}


/**
 * prepare event data fitting template requirements
 */

function _format( req, res, next ) {

  var formatted = {}, dates = [], timingsByDate = {},

  img = req.event.getImage( true ),

  dateRange = req.event.getDateRange( true ),

  _t = timeHelper( { lang: req.lang } ),

  location;

  async.series([
    req.event.getOwner,
    req.event.getAgendaReferences,
    req.event.getAdminAgendas,
    req.event.getState
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
      placeName: req.event.getLocationName(),
      address: req.event.getAddress(),
      region: req.event.getRegion(),
      city: req.event.getCity(),
      postalCode: req.event.getPostalCode(),
      latitude: req.event.getLatitude(),
      longitude: req.event.getLongitude(),
      timings: req.event.getTimings(),
      dates: req.event.getDates(),
      pricingInfo: req.event.getPricingInfo(),
      ticketLink: req.event.getTicketLink(),
      owner: results[ 0 ],
      agendaReferences: results[ 1 ],
      allAgendaReferences: results[ 1 ],
      adminAgendas: results[ 2 ],
      languages: false,
      currentState: results[ 3 ]
    };

    if ( req.event.getLanguages().length > 1 ) {

      formatted.languages = {
        current: req.event.getCurrentLanguage(),
        selection: req.event.getLanguages()
      };

    }

    // deprecate this in favor of .dates
    formatted.timings.forEach( function( timing ) {

      timing.label = _t( timing.start, 'dddd Do - HH:mm' );

    });

    formatted.dates.forEach( function( date ) {

      date.label = _t( date.date, 'dddd Do MMM' );

      date.timings.forEach( function( t ) {

        t.startLabel = _t( t.start, 'HH:mm' );

        t.endLabel = _t( t.end, 'HH:mm' );

      });

    });

    if ( req.agenda ) {

      formatted.importUri = req.genUrl( 'agendaEventActionShow', {
        slug: req.agenda.slug,
        eventSlug: req.event.slug
      });

    } else {

      formatted.importUri = req.genUrl( 'eventActionShow', { 
        eventSlug: req.event.slug
      } );

    }


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

  req.formatted.locationLink = req.genUrl( 'embedShow', {
    uid: req.params.uid,
    search: {
      location: req.event.getLocationName().slug
    }
  });

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

  req.formatted.locationLink = req.genUrl( 'customEmbedShow', {
    uid: req.params.uid,
    embedUid: req.params.embedUid,
    search: {
      location: req.event.getLocationName().slug
    }
  });

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
    agendaUid: req.agenda ? req.agenda.uid : false,
    ownerUid: req.formatted.owner.uid,
    adminAgendaUids: req.formatted.adminAgendas ? req.formatted.adminAgendas.map( function( a ) { return a.uid; } ) : []
  };

  return data;

}