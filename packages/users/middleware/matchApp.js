"use strict";

const createHistory = require( 'react-router/lib/createMemoryHistory' );
const createStore = require( '../react/build/create' );
const { syncHistoryWithStore } = require( 'react-router-redux' );
const { match } = require( 'react-router' );
const getRoutes = require( '../react/build/routes' );


module.exports = function matchApp( path, cb ) {

  return ( req, res, next ) => {

    const url = req.originalUrl.replace( path, '' );
    const memoryHistory = createHistory( url );
    const store = createStore( memoryHistory );
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
