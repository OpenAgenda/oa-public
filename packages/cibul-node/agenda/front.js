var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

lib = require( '../lib/lib' ),

agendaSvc = require( '../services/agenda/agenda' ),

embedSvc = require( '../services/embed/embed' ),

path,

mw = cmn.loadMiddlewares( 'search' ),

perPage = 20,

log = require( '../lib/logger' )( 'agenda front' ),

deepExtend = require( 'deep-extend' ),

wn = require( 'when/node' ),

es = require( 'ES' )( config.es ),

model = cmn.getCibulModel(),

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

  dev: [ 'get', '/agendas/:uid/embeds/:embedUid', [ 
    agendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    _loadEvents,
    embedSvc.mw.renderList,
    dev
  ] ],

  embedControlData: [ 'get', '/agendas/:uid/embeds/:embedUid/controldata', [ 
    agendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    controlData
  ] ],
  
  controlData: [ 'get', '/agendas/:uid/controldata', [ 
    agendaSvc.mw.load( 'uid' ),
    controlData
  ] ],
  
  embedShow: [ 'get', '/agendas/:uid/embed/events', [
    agendaSvc.mw.load( 'uid' ),
    _formatAgendaData( 'embed' ),
    _loadIsPassed,
    _loadEvents,
    _loadTemplateUris,
    cmn.loadBaseData( _layoutData, 'embedDefault.css' ),
    show
  ] ],
  
  customEmbedShow: [ 'get', '/agendas/:uid/embeds/:embedUid/events', [ 
    agendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    _formatAgendaData( 'customEmbed' ),
    _loadIsPassed,
    _formatEmbedData,
    _loadEvents,
    _loadTemplateUris,
    cmn.loadBaseData( _layoutData, 'embedDefault.css' ),
    _loadCustomLayoutData,
    show
  ] ],
  
  agendaShow: [ 'get', '/:slug', [ 
    agendaSvc.mw.load( 'slug' ),
    _formatAgendaData( 'show' ),
    _loadIsPassed,
    _loadEvents, 
    _loadTemplateUris,
    cmn.loadBaseData( _layoutData, 'oa.css' ),
    show
  ] ]

};

module.exports = function( p ) {

  path = p;

  var router = modLib.Router( routes );

  router.pre( [
    cmn.flashSetter,
    cmn.loadSession,
    mw.search.cleanSearch,
    mw.search.buildEsQuery( perPage )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}



/**
 * controllers
 */


function dev( req, res ) {

  var html = [
    '<!DOCTYPE html>',
    '<html>',
      '<head></head>',
      '<body>',
        req.rendered,
      '</body>',
    '</html>'
  ].join( '' )

  res.send( html );

}

function show( req, res ) {

  if ( req.xhr ) {

    // there is no embed partial
    req.template = 'agenda/show';

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


function _loadIsPassed( req, res, next ) {

  var now = new Date();

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
      routeName: req.mode ? modes[ req.mode ].uri : false,
      current: req.query.page || 1,
      total: totalItems,
      perPage: perPage
    }
  };

};