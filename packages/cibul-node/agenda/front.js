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

i18n = require( '../i18n/i18n' ),

timeHelper = require( 'cibulTemplates' ).helpers.time,

model = cmn.getCibulModel(),

modes = {

  embed: {
    template: 'agenda/embedShow',
    uri: 'agendaEmbedShow',
    eventUri: 'agendaEmbedEventShow',
    base: [ 'uid' ],
    eventQuery: { eventUid: 'uid' }
  },

  customEmbed: {
    template: 'agenda/newEmbedShow',
    uri: 'agendaCustomEmbedShow',
    eventUri: 'agendaCustomEmbedEventShow',
    base: [ 'uid', 'embedUid' ],
    eventQuery: { eventUid: 'uid' }
  }

},


routes = {

  embedControlData: [ 'get', '/agendas/:uid/embeds/:embedUid/controldata', [ 
    agendaSvc.mw.load( 'uid', 'uid', true ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    controlData
  ] ],
  
  controlData: [ 'get', '/agendas/:uid/controldata', [ 
    agendaSvc.mw.load( 'uid', 'uid', true ),
    controlData
  ] ],
  
  embedShow: [ 'get', '/agendas/:uid/embed/events', [
    agendaSvc.mw.load( 'uid' ),
    agendaSvc.mw.search( perPage ),
    _format,
    _formatEmbedLinks,
    embedSvc.mw.renderEventItems,
    showXhr( 'agenda/show' ), // this needs to change
    cmn.loadBaseData( _layoutData, 'oae.css' ),  // this needs to switch to embed base css ( can be deactivated )
    embedShow
  ] ],
  
  customEmbedShow: [ 'get', '/agendas/:uid/embeds/:embedUid/events', [ 
    agendaSvc.mw.load( 'uid' ),
    embedSvc.mw.load( 'embedUid', 'uid' ),
    agendaSvc.mw.search( perPage ),
    _format,
    _formatEmbedData,
    _formatCustomEmbedLinks,
    embedSvc.mw.renderEventItems,
    showXhr( 'agenda/show'),
    cmn.loadBaseData( _layoutData, 'oae.css' ),
    _loadCustomLayoutData,
    embedShow
  ] ],
  
  agendaShow: [ 'get', '/:slug', [ 
    agendaSvc.mw.load( 'slug' ),
    agendaSvc.mw.search( perPage ),
    _format,
    _formatShowLinks,
    showXhr( 'agenda/show' ),
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


function showXhr( template ) {

  return function ( req, res, next ) {

    if ( !req.xhr ) return next();

    cmn.renderTemplate( req, template, req.templateData, function( err, partial ) {

      cmn.renderJson( req, res, {
        success: true,
        partial: partial,
        total: req.templateData.total
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


function embedShow( req, res ) {

  lib.extend( req.templateData, {
    uid: req.agenda.uid,
    isEmpty: req.agenda.isEmpty,
    renders: req.renders,
    pager: {
      base: { uid: req.agenda.uid },
      routeName: 'agendaEmbedShow',
      current: req.query.page || 1,
      total: req.total,
      perPage: perPage
    }
  } );

  cmn.render( req, res, 'agenda/embedShow', req.templateData );

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


/**
 * format data to template requirements
 */

function _format( req, res, next ) {

  var _t = timeHelper( { lang: req.lang } ),

  formattedEvents = req.events.map( function( e ) { 

    return _formatEvent( e, _t, req.lang );
    
  } );

  req.templateData = {
    events: formattedEvents,
    hasSearchQuery: !!lib.size( req.query.search ),
    passed: req.agenda.passed,
    total: req.total
  };

  req.events = formattedEvents;

  next();

}


function _formatEvent( event, _t, lang ) {

  var inst = model.events().instance( event ),

  img = inst.getImage( true ),

  dateRange = inst.getDateRange( true );

  return lib.extend( inst, {
    dateRange: i18n( dateRange[ 0 ], _t( dateRange[1] ), lang ).replace( ':', lang=='fr' ? 'h' : ':' ),
    closestDate: inst.getClosestDate(),
    title: inst.getTitle(),
    image: img.replace( 'cibuldev', 'cibul' ),
    thumbnail: inst.getThumbnail( false ),
    description: inst.getDescription(),
    placeName: inst.getLocationName(),
    organization: event.organization ? { slug: event.organizationSlug, label: event.organization } : false
  } );

}


function _formatShowLinks( req, res, next ) {

  req.templateData.events.forEach( function( e ) {

    e.link = req.genUrl( 'agendaEventShow', { 
      slug: req.agenda.slug,
      eventSlug : e.slug,
      lang : req.lang 
    } );

    e.importUri = req.genUrl( 'eventActionShow', { eventSlug: e.slug } );

  });

  next();

}


function _formatEmbedLinks( req, res, next ) {

  req.templateData.events.forEach( function( e ) {

    e.link = req.genUrl( 'agendaEmbedEventShow', { 
      uid: req.agenda.uid,
      eventUid: e.uid,
      lang: req.lang
    });

  } );

  next();

}

function _formatCustomEmbedLinks( req, res, next ) {

  req.templateData.events.forEach( function( e ) {

    e.link = req.genUrl( 'agendaCustomEmbedEventShow', {
      uid: req.agenda.uid,
      embedUid: req.embed.uid,
      eventUid: e.uid,
      lang: req.lang
    });

  } );

  next();

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
      image: req.agenda.getImage( false ),
      passed: req.agenda.passed
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

  // only used for event item render
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