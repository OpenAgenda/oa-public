"use strict";

const cmn = require( '../lib/commons-app' );
const agendaSvc = require( '../services/agenda' );

const preMw = [
  cmn.loadLogger( 'search front' ),
  cmn.redirectLegacySearch,
  _maintain( [ 'page', 'search' ] ),
];


module.exports = app => {

  app.get(
    '/events/search',
    preMw,
    searchEvents
  );

  app.get(
    '/widgets/:uid/search',
    preMw,
    agendaSvc.mw.load( 'uid', { cache: true } ),
    agendaSvc.mw.browserCache,
    widgetSearchEvents
  );

  app.get(
    '/widgets/:uid/:embedUid/search',
    preMw,
    agendaSvc.mw.load( 'uid', { cache: true } ),
    agendaSvc.mw.browserCache,
    widgetSearchEvents
  );

  app.get(
    '/agendas/search',
    preMw,
    searchAgendas
  );

  app.get(
    '/events/latest',
    preMw,
    latestEvents
  );

  app.get(
    '/agendas/latest',
    preMw,
    latestAgendas
  );

}


/**
 * controllers
 */

function searchEvents( req, res, next ) {

  req.cleanSearch = req.query.oaq;

  if ( !req.cleanSearch || !req.cleanSearch.what.length ) {

    req.log.info( 'request received for searchEvents with no params.' );

    return res.redirect( 302, '/events/latest' );

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

  req.log.info( 'request received for latestEvents.' );

  res.redirect( 301, req.genUrl( 'agendaSearch' ) );

}


function searchAgendas( req, res ) {

  req.cleanSearch = req.query.oaq;

  if ( !req.query.oaq || !req.query.oaq.what.length ) {

    req.log.info( 'request received for searchAgendas with no params.' );

    return res.redirect( 302, '/agendas/latest' );

  }

  res.redirect( 301, req.genUrl( 'agendaSearch', { search: req.cleanSearch } ) );

}


function latestAgendas( req, res ) {

  req.log.info( 'request received for latestAgendas' );

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
