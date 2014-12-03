/**
 * search agenda content to public
 */

"use strict";

var appName = 'agenda/front',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

mw = cmn.loadMiddlewares( 'search' ),

perPage = 20,

routes = {
  agendaShow: [ 'get', show, '' ]
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

  app.param( 'slug', cmn.loadAgenda );

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadBaseData( _layoutData ),
    mw.search.cleanSearch,
    mw.search.buildEsQuery( app.get( 'perPage' ) )
  ] );

  return exposed;

}


/**
 * controllers
 */

function show( req, res ) {

  req.esQuery.reviewId = req.agenda.id;

  req.esQuery.order = [ 'upcoming' ];

  wn.call( es.events().search, req.esQuery )

  .then( mw.search.prepareEvents )

  .spread( function( events, total ) {

    var templateData =  lib.extend({
      events: events,
      total: total,
      scriptParams: {
        total: total
      }
    }, _pager( req, 'agenda/show', total ) );

    if ( req.xhr ) {

      cmn.renderTemplate( req, 'agenda/show', templateData, function( err, partial ) {

        cmn.renderJson( req, res, {
          success: true,
          partial: partial,
          total: total
        } );

      });

    } else {

      cmn.render( req, res, 'agenda/show', templateData );

    }

  } );

}



function _layoutData( req, res ) {

  return {
    uid: req.agenda.uid,
    slug: req.agenda.slug,
    title: req.agenda.title,
    description: req.agenda.description,
    url: req.agenda.url,
    image: req.agenda.getImage( false ),
    theme: req.agenda.getTheme(),
    scriptParams: {
      perPage: perPage,
      uid: req.agenda.uid
    }
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