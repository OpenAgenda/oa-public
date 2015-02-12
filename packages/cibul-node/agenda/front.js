"use strict";

/**
 * search agenda content to public
 */

var appName = 'agenda/front',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

mw = cmn.loadMiddlewares( 'search' ),

perPage = 20,

modes = {
  show: {
    template: 'agenda/show',
    uri: 'agendaShow',
    eventUri: 'agendaEventShow',
    base: [ 'slug' ],
    eventQuery: { eventSlug: 'slug' }
  },
  embed: {
    template: 'agenda/embedShow',
    uri: 'agendaEmbedShow',
    eventUri: 'agendaEmbedEventShow',
    base: [ 'uid' ],
    eventQuery: { eventUid: 'uid' }
  },
  customEmbed: {
    template: 'agenda/embedShow',
    uri: 'agendaCustomEmbedShow',
    eventUri: 'agendaCustomEmbedEventShow',
    base: [ 'uid', 'embedUid' ],
    eventQuery: { eventUid: 'uid' }
  }
},

routes = {
  
  embedControlData: [ 'get', controlData, '/agendas/:uid/embeds/:embedUid/controldata', [ 
    cmn.loadAgenda( 'uid' ), _loadEmbed( 'embedUid', 'uid' ) 
  ] ],
  
  controlData: [ 'get', controlData, '/agendas/:uid/controldata', [ 
    cmn.loadAgenda( 'uid' ) 
  ] ],
  
  embedShow: [ 'get', show, '/agendas/:uid/embed/events', [
    cmn.loadAgenda( 'uid' ),
    _formatAgendaData( 'embed' ),
    _loadEvents,
    _loadTemplateUris,
    cmn.loadBaseData( _layoutData, 'embedDefault.css' )
  ] ],
  
  customEmbedShow: [ 'get', show, '/agendas/:uid/embeds/:embedUid/events', [ 
    cmn.loadAgenda( 'uid' ), 
    _loadEmbed( 'embedUid', 'uid' ),
    _formatAgendaData( 'customEmbed' ),
    _formatEmbedData,
    _loadEvents,
    _loadTemplateUris,
    cmn.loadBaseData( _layoutData, 'embedDefault.css' ),
    _loadCustomLayoutData
  ] ],
  
  agendaShow: [ 'get', show, '/:slug', [ 
    cmn.loadAgenda( 'slug' ), 
    _formatAgendaData( 'show' ),
    _loadEvents, 
    _loadTemplateUris,
    cmn.loadBaseData( _layoutData )
  ] ],
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

  app.use( cmn.urlGenSetter( appName, path ) );

  cmn.loadRoutes( app, routes, [
    cmn.flashSetter,
    cmn.loadSession,
    mw.search.cleanSearch,
    mw.search.buildEsQuery( app.get( 'perPage' ) )
  ] );

  return exposed;

}


function _loadEmbed( queryName, fieldName ) {

  return function( req, res, next ) {

    var getParams = {};

    getParams[ fieldName ] = req.params[ queryName ];

    model.reviewEmbeds().get( getParams, function( err, obj ) {

      if ( err ) return cmn.catchError( req, res )( err );

      if ( !obj ) return cmn.catchError( req, res )( 'embed not found' );

      req.reviewEmbed = model.reviewEmbeds().instance( obj );

      next();

    } );

  }

}


function _formatAgendaData( mode ) {

  return function( req, res, next ) {

    req.mode = mode;

    req.template = modes[ mode ].template;

    req.templateData = {
      uid: req.agenda.uid,
      slug: req.agenda.slug,
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( false )
    };

    if ( req.params.embedUid ) {

      req.templateData.embedUid = req.params.embedUid;

    }

    next();

  }

}


function _formatEmbedData( req, res, next ) {

  req.templateData.customCss = req.reviewEmbed.getCustomCss();

  req.templateData.linkCss = req.reviewEmbed.getLinkCss();

  req.templateData.useDefaultCss = req.reviewEmbed.getUseDefaultCss();

  next();

}


function _loadTemplateUris( req, res, next ) {

  req.templateData.eventUri = modes[ req.mode ].eventUri;

  req.templateData.base = {};

  modes[ req.mode ].base.forEach( function( name ) {

    req.templateData.base[ name ] = req.templateData[ name ];

  });

  req.templateData.events.forEach( function( e ) {

    e.query = {};

    for ( var i in modes[ req.mode ].eventQuery ) {

      e.query[ i ] = e[ modes[ req.mode ].eventQuery[ i ] ]

    }

  } );

  next();

}

function _loadEvents( req, res, next ) {

  var isEmpty = false;

  req.esQuery.reviewId = req.agenda.id;

  req.esQuery.order = [ 'upcoming' ];

  wn.call( req.agenda.hasPublishedEvents )

  .then( function( hasPublishedEvents ) {

    if ( !hasPublishedEvents ) {

      isEmpty = true;

      return { data: [], total: 0 };

    } else {

      return wn.call( es.events().search, req.esQuery )

    }

  })

  .then( mw.search.prepareEvents )

  .spread( function( events, total ) {

    req.templateData = lib.extend( req.templateData, {
      isEmpty: isEmpty,
      events: events,
      total: total,
      scriptParams: {
        total: total,
        empty: isEmpty
      }
    }, _pager( req, total ) );

    next();

  } );

}


/**
 * controllers
 */

function show( req, res ) {

  if ( req.xhr ) {

    // there is no embed partial
    req.template = 'agenda/show';

    cmn.renderTemplate( req, req.template, req.templateData, function( err, partial ) {

      cmn.renderJson( req, res, {
        success: true,
        partial: partial,
        total: req.templateData.scriptParams.total
      } );

    });

  } else {

    cmn.render( req, res, req.template, req.templateData );

  }

}


function controlData( req, res ) {

  wn.call( ( req.embed ? req.embed : req.agenda ).getControlData )

  .then( function( controlData ) {

    cmn.renderJson( req, res, {
      success: true,
      code: 200,
      data: controlData
    });

  } )

  .catch( function( err ) {
    
    cmn.renderJson( req, res, {
      success: false,
      error: err
    });

  } );

}

function _layoutData( req, res ) {

  var url = req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { abs: true } );

  var data = {
    theme: req.agenda.getTheme(),
    queryLang: req.query.lang ? req.query.lang : false,
    scriptParams: {
      perPage: perPage,
      uid: req.agenda.uid
    },
    metas: {
      title: req.agenda.title,
      ogSiteName: { property: 'og:site_name', content: 'Cibul' },
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

  return data;

}


/**
 * remove embed css
 */

function _loadCustomLayoutData( req, res, next ) {

  if ( !req.templateData.useDefaultCss.list ) {

    delete req.baseData.head.css.main;

  }

  if ( req.templateData.linkCss ) {

    req.baseData.head.css.embedLink = req.templateData.linkCss;

  }

  next();

}


function _loadEmbedByUid( req, res, next ) {

  var embedUid = req.params[ 'embedUid' ];

  wn.call( req.agenda.embeds.get, { uid: embedUid } )

  .then( function( data ) {

    if ( !data ) throw { code: 404 };

    req.embed = model.reviewEmbeds().instance( data );

    req.log.load({ embed: req.embed.uid });

    next();

  })

  .catch( cmn.catchError( req, res, true ) );

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

function _pager( req, totalItems ) {

  return {
    pager: {
      base: req.templateData.base,
      routeName: modes[ req.mode ].uri,
      current: req.query.page || 1,
      total: totalItems,
      perPage: perPage
    }
  };

};


module.exports = init;