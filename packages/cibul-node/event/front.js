/**
 * search agenda content to public
 */

"use strict";

var appName = 'event/front',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

mw = cmn.loadMiddlewares( 'search' ),

perPage = 20,

routes = {
  agendaEventShow: [ 'get', agendaEventShow, '/:slug/events/:eventSlug' ],
  eventShow: [ 'get', show, '/events/:eventSlug' ]
},

log = require( '../lib/logger' )( appName ),

async = require( 'async' ),

config = require( '../config' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ),

es = require( 'ES' )( config.es ),

app,

path,

model = cmn.getCibulModel();


function init( p ) {

  log( 'debug', 'initing' );

  path = p,

  cmn.registerRoutes( appName, path, routes );

  return exposed;

}


function load( main ) {

  if ( app ) {

    log( 'debug', 'this app has already been loaded' );

    return;

  }

  log( 'debug', 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.set( 'perPage', 20 );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.loadAgenda( 'slug' ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadBaseData( _layoutData )
  ] );

  app.param( 'eventSlug', cmn.loadEvent );

  return exposed;

}


/**
 * controllers
 */

function agendaEventShow( req, res ) {
  
  cmn.render( req, res, 'event/show', _eventData( req, res ) );

}

function show( req, res ) {

  cmn.render( req, res, 'event/show', _eventData( req, res ) );

}


function _eventData( req, res ) {

  return {
    event: {
      uid: req.event.uid,
      slug: req.event.slug,
      title: req.event.getTitle(),
      image: req.event.getImage( false ),
      dateRange: req.event.getDateRange( true ),
      description: req.event.getDescription(),
      freeText: req.event.getFreeText(),
      tags: req.event.getTags(),
      placeName: req.event.locations ? req.event.locations[0].name : false,
      address: req.event.locations ? req.event.locations[0].address : false,
      latitude: req.event.locations ? req.event.locations[0].latitude : false,
      longitude: req.event.locations ? req.event.locations[0].longitude : false,
      timings: req.event.locations ? req.event.locations[0].timings : [],
    }
  }

}



function _layoutData( req, res ) {

  var data = {
    metas: {
      title: req.event.getTitle(),
      ogSiteName: { property: 'og:site_name', content: 'Cibul' },
      ogTitle: { property: 'og:title', content: req.event.getTitle() },
      ogDescription: { property: 'og:description', content: req.event.getDescription() },
      ogLocale: { property: 'og:locale', content: req.lang },
      "twitter:card" : "summary_large_image",
      "twitter:title" : req.event.getTitle(),
      "twitter:description" : req.event.getDescription(),
      "twitter:domain" : config.domain
    }
  };

  if ( req.event.image ) {

    lib.extend( data.metas, {
      ogImage: { property: 'og:image', content: req.event.getImage( true ) },
      "twitter:image:src" : req.event.getImage( true )
    });

  }

  if ( !req.agenda ) {

    data.loner = true;

    data.metas.ogUrl = {
      property: 'og:url',
      content: req.genUrl( 'eventShow', { eventSlug: req.event.slug }, { abs: true } )
    };

    return data;

  } else {

    data.metas.ogUrl = {
      property: 'og:url',
      content: req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: req.event.slug }, { abs: true } )
    };

    return lib.extend( data, {
      loner: false,
      uid: req.agenda.uid,
      slug: req.agenda.slug,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( false ),
      theme: req.agenda.getTheme()
    });

  }

}


module.exports = init;