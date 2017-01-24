"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

perPage = 20,

lib = require( '../lib/lib' ),

wn = require( 'when/node' ),

async = require( 'async' ),

model = require( '../services/model' ),

agendaSvc = require( '../services/agenda' ),

eventSvc = require( '../services/event' ),

routes = {

  searchEvents: [ 'get', '/events/search', [
    searchEvents
  ] ],

  widgetSearchEvents: [ 'get', '/widgets/:uid/search', [
    agendaSvc.mw.load( 'uid', { cache: true } ),
    agendaSvc.mw.browserCache,
    widgetSearchEvents
  ] ],

  widgetEmbedSearchEvents: [ 'get', '/widgets/:uid/:embedUid/search', [
    agendaSvc.mw.load( 'uid', { cache: true } ),
    agendaSvc.mw.browserCache,
    widgetSearchEvents
  ] ],

  searchAgendas: [ 'get', '/agendas/search', [
    searchAgendas
  ] ],

  latestEvents: [ 'get', '/events/latest', [
    latestEvents
  ] ],

  latestAgendas: [ 'get', '/agendas/latest', [
    latestAgendas
  ] ]
};

module.exports = function( p ) {

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'search front' ),
    cmn.redirectLegacySearch,
    _maintain( [ 'page', 'search' ] ),
  ] );

  return {
    load: router.load( p ),
    paths: modLib.getPaths( p, routes )
  }

}


/**
 * controllers
 */

function searchEvents( req, res, next ) {

  req.cleanSearch = req.query.oaq;

  if ( !req.cleanSearch || !req.cleanSearch.what.length ) {

    req.log( 'info', 'request received for searchEvents with no params.' );

    return res.redirect( 302, req.genUrl( 'latestEvents' ) );

  }

  res.redirect( 301, req.genUrl( 'agendaSearch', { search: req.cleanSearch } ) );

}


function widgetSearchEvents( req, res ) {

  req.agenda.aggregate( req.query.oaq, {
    showAll: false
  }, function( err, result ) {

    return cmn.renderJson( req, res, result );

  });

}


function latestEvents( req, res ) {

  req.log( 'info', 'request received for latestEvents.' );

  res.redirect( 301, req.genUrl( 'agendaSearch' ) );

}


function searchAgendas( req, res ) {

  req.cleanSearch = req.query.oaq;

  if ( !req.query.oaq || !req.query.oaq.what.length ) {

    req.log( 'info', 'request received for searchAgendas with no params.' );

    return res.redirect( 302, req.genUrl( 'latestAgendas' ) );

  }

  res.redirect( 301, req.genUrl( 'agendaSearch', { search: req.cleanSearch } ) );

}


function latestAgendas( req, res ) {

  req.log( 'info', 'request received for latestAgendas' );

  res.redirect( 301, req.genUrl( 'agendaSearch' ) );

}


function _maintain( queryNames ) {

  return function( req, res, next ) {

    req.templateData  = req.templateData || {};

    req.templateData.maintain = req.templateData.maintain || {};

    queryNames.forEach( function( queryName ) {

      if ( req.query[ queryName ] ) {

        req.templateData.maintain[ queryName ] = req.query[ queryName ];

      }

    });

    next();

  };

}


/**
 * controller helpers
 */

function _error( req, res ) {

  return function( err ) {

    if ( typeof err === 'string' ) err = { message: err };

    cmn.errorResponse( req, res, err );

  };

}


function _pager( req, routeName, totalItems ) {

  return {
    pager: {
      base: { oaq: req.cleanSearch },
      routeName: routeName,
      current: req.query.page || 1,
      total: totalItems,
      perPage: perPage
    }
  };

}


function _cleanEvents( events ) {

  return events.map( function( e ) {

    var inst = eventSvc.instanciate( e );

    return {
      slug: e.slug,
      title: inst.getTitle(),
      description: inst.getDescription(),
      dateRange: inst.getRange(),
      thumbnail: inst.getThumbnail( false ),
      placeName: inst.getLocationName().label
    }

  });

}