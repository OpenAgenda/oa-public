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
    template: 'agenda/new',
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
    _loadIsPassed,
    _loadEvents,
    _loadTemplateUris,
    cmn.loadBaseData( _layoutData, 'embedDefault.css' )
  ] ],
  
  customEmbedShow: [ 'get', show, '/agendas/:uid/embeds/:embedUid/events', [ 
    cmn.loadAgenda( 'uid' ), 
    _loadEmbed( 'embedUid', 'uid' ),
    _formatAgendaData( 'customEmbed' ),
    _loadIsPassed,
    _formatEmbedData,
    _loadEvents,
    _loadTemplateUris,
    cmn.loadBaseData( _layoutData, 'embedDefault.css' ),
    _loadCustomLayoutData
  ] ],
  
  agendaShow: [ 'get', show, '/:slug', [ 
    cmn.loadAgenda( 'slug' ), 
    _formatAgendaData( 'show' ),
    _loadIsPassed,
    _loadEvents, 
    _loadTemplateUris,
    cmn.loadBaseData( _layoutData, 'oa.css' )
  ] ],

  agendaActionShow: [ 'get', actionShow, '/:slug/action', [
    cmn.loadAgenda( 'slug' )
  ] ]
},

log = require( '../lib/logger' )( appName ),

async = require( 'async' ),

deepExtend = require( 'deep-extend' ),

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

      req.embed = model.reviewEmbeds().instance( obj );

      next();

    } );

  }

}


function _loadIsPassed( req, res, next ) {

  var now = new Date();

  console.log( now );

  req.agenda.getLastOccurrence( function( err, lastOccurrence ) {

    req.templateData.passed = now > new Date( lastOccurrence.end );

    next();

  });

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

    req.templateData.importUri = req.genUrl( 'agendaActionShow', { slug: req.agenda.slug } );

    req.templateData.hasSearchQuery = !!lib.size( req.query.search );


    if ( req.params.embedUid ) {

      req.templateData.embedUid = req.params.embedUid;

      req.templateData.scriptParams = { 
        uid: req.params.uid + '/' + req.params.embedUid
      }

    }

    next();

  }

}


function _formatEmbedData( req, res, next ) {

  req.templateData.customCss = req.embed.getCustomCss();

  req.templateData.linkCss = req.embed.getLinkCss();

  req.templateData.useDefaultCss = req.embed.getUseDefaultCss();

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

      e.query[ i ] = e[ modes[ req.mode ].eventQuery[ i ] ];

      e.importUri = req.genUrl( 'eventActionShow', { eventSlug: e.slug });

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

    req.templateData = deepExtend( req.templateData, {
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
    req.template = req.template == 'agenda/embedShow' ? 'agenda/show' : 'agenda/new';

    cmn.renderTemplate( req, req.template, req.templateData, function( err, partial ) {

      cmn.renderJson( req, res, {
        success: true,
        partial: partial,
        total: req.templateData.total
      } );

    });

  } else {

    cmn.render( req, res, req.template, req.templateData );

  }

}


function actionShow( req, res ) {

  w( {
    uid: req.agenda.uid,
    hasAggregator: false,
    agendas: []
  } )

  .then( function( values ) {

    if ( !req.session.logged ) return values;

    return w.promise( function( resolve, reject ) {

      // list agendas which have the aggregator feature and of which user is admin

      model.reviews().list( { aggregator: true, adminId: req.session.userId }, function( err, agendas ) {

        if ( err ) return reject( err );

        values.agendas = agendas.map( function( a ) {

          return {
            id: a.id,
            title: a.title,
            aggUid: a.uid,
            aggregates: false
          }

        }).filter( function( a ) {

          return a.id !== req.agenda.id;

        });

        if ( values.agendas.length ) values.hasAggregator = true;

        resolve( values );

      });

    });    

  })

  .then( function( values ) {

    if ( !req.session.logged ) return values;

    // get current aggregating agendas
    // and cross reference with users admined agendas

    return w.promise( function( resolve, reject ) {

      req.agenda.getAggregators( function( err, result ) {

        var aggAgendasIds = result.map( function( a ) {

          return a.id;

        });

        values.agendas.map( function( a ) {

          if ( aggAgendasIds.indexOf( a.id ) !== -1 ) {

            a.aggregates = true;

          }

          return a;

        });

        resolve( values );

      })

    });

  })

  .done( function( values ) {

    var renderParams = [ req, res, 'agenda/action', values ];

    if ( req.xhr ) {

      cmn.render.apply( null, renderParams );

    } else {

      cmn.loadBaseData( _layoutData, 'oa.css' )( req, res, function() {

        cmn.render.apply( null, renderParams );

      } );

    }
    
  }, cmn.catchError( req, res ) );

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
      uid: req.agenda.uid,
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