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

routes = {
  embedControlData: [ 'get', controlData, '/agendas/:uid/embeds/:embedUid/controldata', [ cmn.loadAgenda( 'uid' ), _loadEmbedByUid ] ],
  controlData: [ 'get', controlData, '/agendas/:uid/controldata', [ cmn.loadAgenda( 'uid' ) ] ],
  embedShow: [ 'get', show( 'agenda/embedShow' ), '/agendas/:uid/embed/events', [ cmn.loadAgenda( 'uid' ), cmn.loadBaseData( _layoutData ) ] ],
  agendaShow: [ 'get', show( 'agenda/show' ), '/:slug', [ cmn.loadAgenda( 'slug' ), cmn.loadBaseData( _layoutData ) ] ],
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


/**
 * controllers
 */

function show( template ) {

  return function( req, res ) {

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

      var templateData =  lib.extend({
        isEmpty: isEmpty,
        events: events,
        total: total,
        scriptParams: {
          total: total,
          empty: isEmpty
        }
      }, _pager( req, template, total ) );

      if ( req.xhr ) {

        cmn.renderTemplate( req, template, templateData, function( err, partial ) {

          cmn.renderJson( req, res, {
            success: true,
            partial: partial,
            total: total
          } );

        });

      } else {

        cmn.render( req, res, template, templateData );

      }

    } );

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
    uid: req.agenda.uid,
    slug: req.agenda.slug,
    title: req.agenda.title,
    description: req.agenda.description,
    url: req.agenda.url,
    image: req.agenda.getImage( false ),
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

function _pager( req, routeName, totalItems ) {

  return {
    pager: {
      base: { slug: req.params.slug },
      routeName: routeName,
      current: req.query.page || 1,
      total: totalItems,
      perPage: perPage
    }
  };

};


module.exports = init;