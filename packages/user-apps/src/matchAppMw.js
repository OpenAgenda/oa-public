"use strict";

const { match } = require( 'react-router' );
const createHistory = require( 'react-router/lib/createMemoryHistory' );
const { syncHistoryWithStore } = require( 'react-router-redux' );
const createStore = require( './create' );
const getRoutes = require( './routes' );

module.exports = function matchApp( params, path, cb ) {

  return ( req, res, next ) => {

    const url = req.originalUrl/*.replace( path, '' )*/;

    const memoryHistory = createHistory( url );
    const store = createStore( memoryHistory, params.state || {} );
    const history = syncHistoryWithStore( memoryHistory, store );

    match( {
        history,
        routes: getRoutes( store ),
        location: url
      },
      ( error, redirectLocation, renderProps ) => {
        if ( redirectLocation ) {
          res.redirect( redirectLocation.pathname + redirectLocation.search );
        } else if ( error ) {
          console.error( 'ROUTER ERROR:', error );
          next( error );
        } else if ( renderProps ) {
          cb( req, res );
        } else {
          next(); // Not found here
        }
      }
    );

  }

};

