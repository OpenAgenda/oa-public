const React = require( 'react' );
const { createElement } = React;

const createHistory = require( 'react-router/lib/createMemoryHistory' );
const { Provider } = require( 'react-redux' );
const { syncHistoryWithStore } = require( 'react-router-redux' );
const { match } = require( 'react-router' );
const { ReduxAsyncConnect, loadOnServer } = require( 'redux-connect' );


module.exports = function matchAppMw( createStore, getRoutes, ApiClient ) {

  return ( params, path, cb ) => ( req, res, next ) => {

    const url = req.originalUrl.replace( path, '' );
    const client = new ApiClient( params.state.settings.apiRoot, req );
    const memoryHistory = createHistory( url );
    const store = createStore( memoryHistory, client, params.state );
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
          loadOnServer( Object.assign( {}, renderProps, { store, helpers: { client } } ) ).then( () => {

            const component = createElement(
              Provider,
              { store, key: 'provider' },
              createElement( ReduxAsyncConnect, renderProps )
            );

            cb( req, res, next, { store, component } );

          } ).catch( mountError => {
            console.error( 'MOUNT ERROR:', mountError );
            next( mountError );
          } );

        } else {
          next(); // Not found here
        }
      }
    );

  }

};