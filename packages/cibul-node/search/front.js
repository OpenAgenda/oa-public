"use strict";

var modLib = require( '../lib/moduleLib' ),

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

perPage = 20,

mw = {
  search: require( '../lib/middlewares/search' )
},

lib = require( '../lib/lib' ),

wn = require( 'when/node' ),

async = require( 'async' ),

model = cmn.getCibulModel(),

es = require( 'ES' )( config.es ),

path,

routes = {

  searchEvents: [ 'get', '/events/search', [
    mw.search.cleanSearch,
    mw.search.buildEsQuery( perPage ),
    searchEvents
  ] ],

  widgetSearchEvents: [ 'get', '/widgets/:uid/search', [
    mw.search.cleanSearch,
    mw.search.buildEsQuery( perPage ),
    widgetSearchEvents
  ] ],

  widgetEmbedSearchEvents: [ 'get', '/widgets/:uid/:embedUid/search', [
    mw.search.cleanSearch,
    mw.search.buildEsQuery( perPage ),
    widgetSearchEvents
  ] ],

  searchAgendas: [ 'get', '/agendas/search', [
    mw.search.cleanSearch,
    mw.search.buildEsQuery( perPage ),
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

  path = p;

  var router = modLib.Router( routes );

  router.pre( [
    cmn.loadSession,
    _maintain( [ 'page', 'search' ] ),
    cmn.loadBaseData( _layoutData )
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


/**
 * controllers
 */

function searchEvents( req, res ) {

  if ( !req.cleanSearch || !lib.size( req.cleanSearch ) )  {

    req.log( 'info', 'request received for searchEvents with no params.' );

    return res.redirect( 302, req.genUrl( 'latestEvents' ) );

  }

  req.log( 'info', 'request received for searchEvents with params: %s', JSON.stringify( req.esQuery ) );

  wn.call( es.events().search, req.esQuery )

  .then( mw.search.prepareEvents )

  .spread( function( events, total ) {

    cmn.render( req, res, 'search/events', lib.extend( 
      req.templateData ? req.templateData : {},
      { events: events, searchRes: 'searchEvents', search: req.cleanSearch },
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
    async.apply( model.events().list, { 
      page : req.query.page ? req.query.page : 1, 
      limit : perPage
    } ),
    async.apply( model.events().total )
  ])

  .then( mw.search.prepareEvents )

  .spread( function( events, total ) {

    cmn.render( req, res, 'search/events', lib.extend(
      req.templateData ? req.templateData : {},
      { events: events, searchRes :'searchEvents', search: req.cleanSearch },
      _pager( req, 'latestEvents', total )
    ));

  } )

  .catch( _error( req, res ) );

}


function searchAgendas( req, res ) {

  if ( !req.cleanSearch || !lib.size( req.cleanSearch ) )  {

    req.log( 'info', 'request received for searchAgendas with no params.' );

    return res.redirect( 302, req.genUrl( 'latestAgendas' ) );

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
      req.templateData ? req.templateData : {},
      { agendas: result.data, searchRes: 'searchAgendas', search: req.cleanSearch },
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