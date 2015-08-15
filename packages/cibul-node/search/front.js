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
    cmn.loadSession,
    _maintain( [ 'page', 'search' ] ),
    cmn.loadBaseData( _layoutData )
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

  if ( !req.query.search || !req.query.search.what.length ) {

    req.log( 'info', 'request received for searchEvents with no params.' );

    return res.redirect( 302, req.genUrl( 'latestEvents' ) );

  }

  req.log( 'info', 'request received for searchEvents with query: %s', JSON.stringify( req.query.search ) );
  
  eventSvc.search( req.query.search, { page: req.query.page }, function( err, result ) {

    if ( err ) return next( err );

    cmn.render( req, res, 'search/events', lib.extend( 
      req.templateData ? req.templateData : {}, { 
        events: _cleanEvents( result.events ),
        searchRes: 'searchEvents', 
        search: req.query.search 
      }, _pager( req, 'searchEvents', result.total )
    ));

  } );

}


function widgetSearchEvents( req, res ) {

  req.agenda.aggregate( req.query.search, {
    showAll: false
  }, function( err, result ) {

    return cmn.renderJson( req, res, result );

  });

}


function latestEvents( req, res ) {

  req.log( 'info', 'request received for latestEvents.' );

  wn.call( async.parallel, [
    async.apply( model.events().list, { 
      page : req.query.page ? req.query.page : 1, 
      limit : perPage
    } ),
    async.apply( model.events().total )
  ])

  .spread( function( events, total ) {

    cmn.render( req, res, 'search/events', lib.extend(
      req.templateData ? req.templateData : {},
      {
        events: _cleanEvents( events ),
        searchRes :'searchEvents',
        search: req.cleanSearch
      },
      _pager( req, 'latestEvents', total )
    ));

  } )

  .catch( _error( req, res ) );

}


function searchAgendas( req, res ) {

  req.cleanSearch = req.query.search;

  if ( !req.query.search || !req.query.search.what.length ) {

    req.log( 'info', 'request received for searchAgendas with no params.' );

    return res.redirect( 302, req.genUrl( 'latestAgendas' ) );

  }

  wn.call( agendaSvc.search, req.query.search, { page: req.query.page } )

  .then( _renderAgendas( req, res, 'searchAgendas' ) )

  .catch( _error( req, res ) );

}


function latestAgendas( req, res ) {

  req.log( 'info', 'request received for searchAgendas' );

  wn.call( async.parallel, [
    async.apply( model.agendas().total, {
      upcoming : true,
      orderBy : [ 'r.updated_at desc' ]
    } ),
    async.apply( model.agendas().list, {
      page : req.query.page ? req.query.page : 1,
      limit : perPage,
      upcoming : true,
      orderBy : [ 'r.updated_at desc' ]
    } )
  ])

  .spread( function( total, data ) {

    return {
      total: total,
      data: data
    }

  } )

  .then( _renderAgendas( req, res, 'latestAgendas' ) )

  .catch( _error( req, res ) );

}




function _renderAgendas( req, res, uri ) {

  return function( result ) {

    result.data.forEach( function( agenda ) {

      lib.extend( agenda, {
        categories: [],
        locationInfo: ''
      });

    } );

    cmn.render( req, res, 'search/agendas', lib.extend(
      req.templateData ? req.templateData : {},
      { agendas: result.data, 
        searchRes: 'searchAgendas', 
        search: req.cleanSearch },
      _pager( req, uri, result.total ) 
    ));

  }

}

function _layoutData( req, res ) {

  return {
    queryLang: req.query.lang ? req.query.lang : false
  }

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
      base: {},
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
      dateRange: inst.getDateRange( true ),
      thumbnail: inst.getThumbnail( false ),
      placeName: inst.getLocationName().label
    }

  });

}