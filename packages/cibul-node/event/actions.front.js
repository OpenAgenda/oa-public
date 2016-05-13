"use strict";

var modLib = require( '../lib/moduleLib' ),

utils = require( 'utils' ),

cmn = require( '../lib/commons-app' ),

agendaSvc = require( '../services/agenda' ),

eventSvc = require( '../services/event' ),

mailer = require( '../services/mailer' ),

async = require( 'async' ),

model = require( '../services/model' ),

config = require( '../config' ),

routes = {

  eventActionShow: [ 'get', '/events/:eventSlug/action', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    _conditionalLayout( eventSvc.mw.layoutData, 'oa.css' ),
    actionShow
  ] ],
  
  eventActionDatesShow: [ 'get', '/events/:eventSlug/action/dates', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    _conditionalLayout( eventSvc.mw.layoutData, 'oa.css' ),
    actionDatesShow
  ] ],

  agendaEventActionShow: [ 'get', '/:slug/events/:eventSlug/action', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    _conditionalLayout( eventSvc.mw.layoutData, 'oa.css' ),
    actionShow
  ]],

  agendaEventActionDatesShow: [ 'get', '/:slug/events/:eventSlug/action/dates', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    _conditionalLayout( eventSvc.mw.layoutData, 'oa.css' ),
    actionDatesShow
  ] ],

  agendaEventMailSend: [ 'post', '/:slug/events/:eventSlug/email', [
    agendaSvc.mw.load( 'slug' ),
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    eventMailSend
  ] ],

  eventMailSend: [ 'post', '/events/:eventSlug/email', [
    eventSvc.mw.load( 'eventSlug', 'slug' ),
    eventSvc.mw.format,
    eventSvc.mw.loadUris,
    eventMailSend
  ] ]

}

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


function actionShow( req, res ) {

  var loaders = {
    calendars: _calendarAction,
    agendas: _agendasAction,
    email: _emailAction
  },

  actions = [ 'calendars', 'agendas', 'email' ];

  if ( req.query.action && actions.indexOf( req.query.action ) !== -1 ) {

    actions = [ req.query.action ];

  };

  req.templateData = {
    actions: actions,
    event: {
      uid: req.event.uid,
      title: req.event.getTitle(),
      imports: [],
      uri: req.eventUri,
      params: req.eventUriParams
    },
    agenda: req.agenda ? req.agenda : false,
    logged: req.session.logged
  };

  if ( req.query.back ) {

    req.templateData.back = req.query.back;

  }

  async.eachSeries( actions, function( action, scb ) {

    loaders[ action ]( req, res, scb );

  }, function( err ) {

    if ( err ) return next( err );

    return cmn.render( req, res, 'event/action', req.templateData );

  });

}


function actionDatesShow( req, res ) {

  var service = [ 'google', 'yahoo', 'live' ].indexOf( req.query.service ) !== -1 ? req.query.service : 'google';

  eventSvc.share.addCalendarLinks( req.event, req.genUrl( req.eventUri, req.eventUriParams, { abs: true } ) );

  return cmn.render( req, res, 'event/actionDates', {
    event: {
      uri: req.eventUri,
      timezone: req.event.getLocationDetails().timezone,
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

    req.log( 'will send event as email to %s', emails.join(', ') );

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


function _conditionalLayout( func, css ) {

  return function( req, res, next ) {

    if ( req.xhr ) return next();

    cmn.loadBaseData( func, css )( req, res, next );

  }

} 


function _calendarAction( req, res, next ) {

  var timings = req.event.getTimings(),

  multipleTimings = timings.length > 1;

  eventSvc.share.addCalendarLinks( req.event, req.genUrl( req.eventUri, req.eventUriParams, { abs: true } ) );

  req.templateData.event.imports = timings.length ? [{ 
    label: 'Google Calendar',
    uri: multipleTimings ? req.genUrl( 'eventActionDatesShow', [ req.eventUriParams, { service: 'google' } ] ) : timings[ 0 ].calendarLinks.google,
  },{ 
    label: 'Yahoo! Calendar',
    uri: multipleTimings ? req.genUrl( 'eventActionDatesShow', [ req.eventUriParams, { service: 'yahoo' } ] ) : timings[ 0 ].calendarLinks.yahoo,
  },{ 
    label: 'Windows Live',
    uri: multipleTimings ? req.genUrl( 'eventActionDatesShow', [ req.eventUriParams, { service: 'live' } ] ) : timings[ 0 ].calendarLinks.live
  }] : [];

  req.templateData.event.multipleTimings = multipleTimings;

  next();

}

function _agendasAction( req, res, next ) {

  if ( !req.session.logged ) return next();

  var agendasSharing = req.event.articles

    .filter( function( a ) { return a.isPublished; } )

    .map( function( a ) { return a.review.id; });

  model.reviews().list( { stakeholderId: req.user.id, limit: 200 }, function( err, agendas ) {

    if ( err ) return next( err );

    req.templateData.agendas = agendas.map( function( a ) {

      return {
        uid: a.uid,
        slug: a.slug,
        title: a.title,
        sharing: agendasSharing.indexOf( a.id ) !== -1
      };

    });

    next();

  } );

}

function _emailAction( req, res, next ) {

  req.templateData.mailSendUri = req.genUrl( 'eventMailSend', { 
    eventSlug: req.event.slug 
  } );

  next();

}