"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

agendaSvc = require( '../services/agenda' ),

embedSvc = require( '../services/embed/embed' ),

perPage = 20,

deepExtend = require( 'deep-extend' ),

wn = require( 'when/node' ),

async = require( 'async' ),

i18n = require( '../i18n/i18n' ),

timeHelper = require( 'cibulTemplates' ).helpers.time,

fb = require( 'facebook' ),

model = require( '../services/model' ),

routes = {

  embedControlData: [ 'get', '/agendas/:uid/embeds/:embedUid/controldata', [ 
    agendaSvc.mw.load( 'uid', { basicLoad: true, cache: true } ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    embedSvc.mw.browserCacheControlData,
    controlData
  ] ],
  
  controlData: [ 'get', '/agendas/:uid/controldata', [ 
    agendaSvc.mw.load( 'uid', { basicLoad: true, cache: true } ),
    agendaSvc.mw.browserCacheControlData,
    controlData
  ] ],

  agendaFacebook: [ 'post', '/facebook/tab', [
    fb.tab.loadAgendaId,
    _loadAgendaByAgendaId,
    _redirectToEmbed
  ]],
  
  agendaEmbedShow: [ 'get', '/agendas/:uid/embed/events', [
    agendaSvc.mw.load( 'uid', { cache: true } ),
    agendaSvc.mw.browserCache,
    agendaSvc.mw.search( perPage ),
    _format,
    _appendFacebookParams,
    _formatEmbedLinks,
    embedSvc.mw.renderEventItems,
    showXhr( 'agenda/embedShow' ), 
    cmn.loadBaseData( _layoutData, 'oae.css' ),  // this needs to switch to embed base css ( can be deactivated )
    embedShow
  ] ],
  
  customEmbedShow: [ 'get', '/agendas/:uid/embeds/:embedUid/events', [ 
    agendaSvc.mw.load( 'uid', { cache: true } ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    embedSvc.mw.browserCache,
    agendaSvc.mw.search( perPage ),
    _format,
    _formatCustomEmbedLinks,
    embedSvc.mw.renderEventItems,
    showXhr( 'agenda/embedShow' ),
    cmn.loadBaseData( _layoutData ),
    embedSvc.mw.loadCustomLayoutData,
    embedShow
  ] ],

  customEmbedShowPreview: [ 'get', '/agendas/:uid/previewEmbeds/:embedUid/events', [
    function( req, res, next ) { req.preview = true; next() },
    agendaSvc.mw.load( 'uid', { cache: true } ),
    cmn.checkAdministrator(),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    agendaSvc.mw.search( perPage, true ),
    _format,
    _formatCustomEmbedLinks,
    embedSvc.mw.renderEventItems,
    showXhr( 'agenda/embedShow' ),
    cmn.loadBaseData( _layoutData ),
    embedSvc.mw.loadCustomLayoutData,
    embedShow
  ] ],

  agendaRedirect: [ 'get', '/agendas/:uid', [
    agendaSvc.mw.load( 'uid', { basicLoad: true, cache: true } ),
    redirect
  ] ],
  
  agendaShow: [ 'get', '/:slug', [ 
    agendaSvc.mw.load( 'slug', { cache: true } ),
    agendaSvc.mw.browserCache,
    agendaSvc.mw.search( perPage ),
    _format,
    _formatShowLinks,
    showXhr( 'agenda/show' ),
    cmn.loadBaseData( _layoutData, 'oa.css' ),
    show
  ] ]

};

module.exports = function( path ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'agenda front' ),
    cmn.flashSetter,
    cmn.loadSession
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}



/**
 * controllers
 */


function showXhr( template ) {

  return function ( req, res, next ) {

    if ( !req.xhr ) return next();

    lib.extend( req.templateData, {
      slug: req.agenda.slug
    } );

    if ( req.renders ) req.templateData.renders = req.renders;

    cmn.renderTemplate( req, template, req.templateData, function( err, partial ) {

      cmn.renderJson( req, res, {
        success: true,
        partial: partial,
        total: req.templateData.total,
        page: req.templateData.page
      });

    });

  }

}


function show( req, res ) {

  lib.extend( req.templateData, {
    uid: req.agenda.uid,
    slug: req.agenda.slug,
    title: req.agenda.title,
    description: req.agenda.description,
    url: req.agenda.url,
    image: req.agenda.getImage( false ),
    importUri: req.genUrl( 'agendaActionShow', { slug: req.agenda.slug } ),
    isEmpty: req.agenda.isEmpty
  } );

  cmn.render( req, res, 'agenda/show', req.templateData );

}


function redirect( req, res ) {

  return res.redirect( 301, req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { protocol: 'https://' } ) );

}


function embedShow( req, res ) {

  lib.extend( req.templateData, {
    uid: req.agenda.uid + ( req.embed ? '/' + req.embed.uid : '' ),
    isEmpty: req.agenda.isEmpty,
    renders: req.renders,
    pager: {
      base: { uid: req.agenda.uid },
      routeName: 'agendaEmbedShow',
      current: req.templateData.page,
      total: req.total,
      perPage: perPage
    }
  } );

  cmn.render( req, res, 'agenda/embedShow', req.templateData );

}


function controlData( req, res ) {

  req.log( 'retrieving %s control data', req.embed ? 'embed' : 'agenda' );

  wn.call( ( req.embed ? req.embed : req.agenda ).getControlData )

  .then( function( controlData ) {

    cmn.renderJson( req, res, {
      success: true,
      code: 200,
      data: controlData
    });

  } )

  .catch( function( err ) {

    req.log( 'error', err );

    if ( res.headersSent ) return;
    
    cmn.renderJson( req, res, {
      success: false,
      error: err
    });

  } );

}



/**
 * format data to template requirements
 */

function _format( req, res, next ) {

  var _t = timeHelper( { lang: req.lang } );

  async.map( req.events, function( e, mcb ) {

    _formatEventItem( e, _t, req.lang, mcb );

  }, function( err, formattedEvents ) {

    if ( err ) return cb( err );

    req.templateData = {
      events: formattedEvents,
      hasSearchQuery: !!lib.size( req.query.search ),
      passed: req.agenda.passed,
      total: req.total,
      page: req.query.page || 1
    };

    req.events = formattedEvents;

    next();

  });

}

function _appendFacebookParams( req, res, next ) {

  if ( !req.query.fb ) return next();

  req.templateData.fb = true;

  req.templateData.scriptParams = {
    facebook: true,
    fbAppId: config.auth.facebook.id
  }
  
  next();

}

function _redirectToEmbed( req, res, next ) {

  res.redirect( 303, req.genUrl( 'agendaEmbedShow', { uid: req.agenda.uid, fb: 1 } ) );

}

function _loadAgendaByAgendaId( req, res, next ) {

  if ( !req.agendaId ) return next( 'agenda identifier missing' );

  agendaSvc.get( { id: req.agendaId }, function( err, agenda ) {

    if ( err ) return next( err );

    if ( !agenda ) return next( { code: 404 } );

    req.agenda = agenda;

    next();

  });

}


function _formatEventItem( event, _t, lang, cb ) {

  var inst = model.events().instance( event ),

  img, dateRange;

  inst.switchLanguage( lang );

  img = inst.getImage( true );

  dateRange = inst.getDateRange( true );

  var formatted = lib.extend( inst, {
    dateRange: i18n( dateRange[ 0 ], _t( dateRange[1] ), lang ).replace( ':', lang=='fr' ? 'h' : ':' ),
    closestDate: inst.getClosestDate(),
    title: inst.getTitle(),
    image: img ? img.replace( 'cibuldev', 'cibul' ) : false,
    thumbnail: inst.getThumbnail( false ),
    description: inst.getDescription(),
    placeName: inst.getLocationName(),
    address: inst.getAddress().label,
    placeNameLabel: inst.getLocationName().label,
    city: inst.getCity().label,
    pricingInfo: inst.getPricingInfo(),
    ticketLink: inst.getTicketLink(),
    organization: event.organization ? { slug: event.organizationSlug, label: event.organization } : false,
    category: false
  } );

  inst.getAgendaCategory( function( err, c ) {

    if ( err || !c ) return cb( err, formatted );

    formatted.category = c.label;

    formatted.categorySlug = c.slug;

    cb( null, formatted );

  });

}


function _formatShowLinks( req, res, next ) {

  req.templateData.events.forEach( function( e ) {

    var params = { 
      slug: req.agenda.slug,
      eventSlug : e.slug,
      lang : req.lang 
    };

    if ( req.query.search ) params.search = req.query.search;

    e.link = req.genUrl( 'agendaEventShow', params );

    e.importUri = req.genUrl( 'eventActionShow', { eventSlug: e.slug } );

  });

  next();

}


function _formatEmbedLinks( req, res, next ) {

  req.templateData.events.forEach( function( e ) {

    var params = { 
      uid: req.agenda.uid,
      eventUid: e.uid,
      lang: req.lang
    };

    if ( req.query.fb ) params.fb = 1;

    if ( req.query.search ) params.search = req.query.search;

    e.link = req.genUrl(  'agendaEmbedEventShow', params );

    if ( e.categorySlug ) e.categoryLink = req.genUrl( 'agendaEmbedShow', {
      uid: req.params.uid,
      search: {
        category: e.categorySlug
      }
    });

  } );

  next();

}


function _formatCustomEmbedLinks( req, res, next ) {

  req.templateData.events.forEach( function( e ) {

    var params = {
      uid: req.agenda.uid,
      embedUid: req.embed.uid,
      eventUid: e.uid,
      lang: req.lang
    };

    if ( req.query.search ) params.search = req.query.search;

    e.link = req.genUrl( req.preview ? 'agendaCustomEmbedEventShowPreview' : 'agendaCustomEmbedEventShow', params );

    if ( e.categorySlug ) {

      e.categoryLink = req.genUrl( req.preview ? 'customEmbedShowPreview' : 'customEmbedShow', {
        uid: req.params.uid,
        embedUid: req.embed.uid,
        search: {
          category: e.categorySlug,
          passed: req.query.passed
        },
        lang: req.lang
      });

    }

  } );

  next();

}


function _layoutData( req, res ) {

  req.log( 'loading layout data' );

  var url = req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { abs: true } ),

  data = {
    theme: req.agenda.getTheme(),
    queryLang: req.query.lang ? req.query.lang : false,
    scriptParams: {
      total: req.total,
      perPage: perPage,
      uid: req.agenda.uid + ( req.embed ? '/' + req.embed.uid : '' ),
      lang: req.lang
    },
    metas: {
      title: req.agenda.title,
      ogSiteName: { property: 'og:site_name', content: 'OpenAgenda' },
      ogTitle: { property: 'og:title', content: req.agenda.title },
      ogType: { property: 'og:type', content: 'activity' },
      ogLanguage: { property: 'og:language', content: req.lang },
      ogUrl: { property: 'og:url', content: url },
      "twitter:card" : "summary",
      "twitter:site" : config.twitter.name,
      "twitter:title" : req.agenda.getTitle(),
      "twitter:description" : req.agenda.description,
      "twitter:domain" : config.domain,
      "twitter:url" : url
    }
  };

  if ( req.agenda.image ) {

    lib.extend( data.metas, {
      ogImage: { property: 'og:image', content: req.agenda.getImage( true ) },
      "twitter:image:src" : req.agenda.getImage( true )
    });

  }

  if ( !data.headLinks ) data.headLinks = [];

  data.headLinks.push({
    rel: 'canonical',
    href: req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { abs: true, protocol: 'https://' } )
  });

  return data;

}



function _error( req, res ) {

  return function( err ) {

    if ( typeof err === 'string' ) err = { message: err };

    var link = false;

    if ( req.agenda ) {

      err.link = {
        uri: 'homeShow',
        values: {},
        label: 'go back to home'
      };

    }

    cmn.errorResponse( req, res, err );

  };

}