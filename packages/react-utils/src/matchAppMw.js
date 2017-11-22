import React, { createElement } from 'react';
import createHistory from 'react-router/lib/createMemoryHistory';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import { match } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import VError from 'verror';


export default function matchAppMw( createStore, getRoutes, ApiClient ) {

  return ( params, path, cb ) => ( req, res, next ) => {

    const url = req.originalUrl/*.replace( path, '' )*/;
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
          const redirect = to => {
            throw new VError( { name: 'RedirectError', info: { to } } );
          };

          loadOnServer( Object.assign( {}, renderProps, { store, helpers: { client, redirect } } ) ).then( () => {

            const component = createElement(
              Provider,
              { store, key: 'provider' },
              createElement( ReduxAsyncConnect, renderProps )
            );

            cb( req, res, next, { store, component } );

          } ).catch( mountError => {
            if ( mountError.name === 'RedirectError' ) {
              return res.redirect( VError.info( mountError ).to );
            }

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
