/**
 * site-wide event and agenda search pages
 */

"use strict";

var appName = 'search/front',

exposed = {
  load: load
},

cmn = require( '../lib/commons-app' ),

mw = cmn.loadMiddlewares( 'search' ),

perPage = 20,

routes = {

  searchEvents: [ 'get', searchEvents, '/events/search', [
    mw.search.cleanSearch,
    mw.search.buildEsQuery( perPage )
  ] ],

  widgetSearchEvents: [ 'get', widgetSearchEvents, '/widgets/:uid/search', [
    mw.search.cleanSearch,
    mw.search.buildEsQuery( perPage )
  ] ],

  widgetEmbedSearchEvents: [ 'get', widgetSearchEvents, '/widgets/:uid/:embedUid/search', [
    mw.search.cleanSearch,
    mw.search.buildEsQuery( perPage )
  ] ],

  searchAgendas: [ 'get', searchAgendas, '/agendas/search', [
    mw.search.cleanSearch,
    mw.search.buildEsQuery( perPage )
  ] ],

  latestEvents: [ 'get', latestEvents, '/events/latest' ],
  latestAgendas: [ 'get', latestAgendas, '/agendas/latest' ]

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

  path = p;

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
    cmn.loadSession,
    cmn.loadBaseData()
  ] );

  return exposed;

}


/**
 * controllers
 */

function searchEvents( req, res ) {
  
  if ( !req.cleanSearch || !lib.size( req.cleanSearch ) )  {

    req.log( 'info', 'request received for searchEvents with no params.' );

    return cmn.redirect( req, res, 'latestEvents' );

  }

  req.log( 'info', 'request received for searchEvents with params: %s', JSON.stringify( req.esQuery ) );

  wn.call( es.events().search, req.esQuery )

  .then( mw.search.prepareEvents )

  .spread( function( events, total ) {

    cmn.render( req, res, 'search/events', lib.extend({ 
      events: events, searchRes: 'searchEvents', search: req.cleanSearch },
      _pager( req, 'searchEvents', total )
    ));

  })

  .catch( _error( req, res) );

}


function widgetSearchEvents( req, res ) {

  var uid = req.params.uid.split('/')[ 0 ];

  wn.call( model.reviews().get, { uid: uid } )

  .then( function( agenda ) {

    req.esQuery.reviewId = agenda.id;

    return wn.call( es.events().aggregate, req.esQuery );

  } )

  .then( function( result ) {

    return cmn.renderJson( req, res, result );

  } )

  .catch( _error( req, res ) );

}


function latestEvents( req, res ) {

  req.log( 'info', 'request received for latestEvents.' );

  wn.call( async.parallel, [
    async.apply( model.events().total ),
    async.apply( model.events().list, { 
      page : req.query.page ? req.query.page : 1, 
      limit : perPage
    } )
  ])

  .spread( function( total, data ) {

    var result = mw.search.prepareEvents( { total: total, data: data } );

    cmn.render( req, res, 'search/events', lib.extend({
      events: result[0], searchRes :'searchEvents', search: req.cleanSearch },
      _pager( req, 'latestEvents', result[1] )
    ));

  } )

  .catch( _error( req, res ) );

}


function searchAgendas( req, res ) {

  if ( !req.cleanSearch || !lib.size( req.cleanSearch ) )  {

    req.log( 'info', 'request received for searchAgendas with no params.' );

    return cmn.redirect( req, res, 'latestAgendas' );

  }

  req.esQuery.deep = true;

  req.log( 'info', 'request received for searchAgendas with params: %s', JSON.stringify( req.esQuery ) );

  wn.call( es.reviews().search, req.esQuery )

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
      { agendas: result.data, searchRes: 'searchAgendas', search: req.cleanSearch },
      _pager( req, uri, result.total ) 
    ));

  }

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


module.exports = init;