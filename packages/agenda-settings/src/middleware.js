const React = require( 'react' );
const logs = require( '@openagenda/logs' );
const mwUploadImage = require( '@openagenda/image-upload/lib/middleware' );
const createHistory = require( 'react-router/lib/createMemoryHistory' );
const { Provider } = require( 'react-redux' );
const createStore = require( './react/redux/create' );
const ApiClient = require( './helpers/ApiClient' );
const { syncHistoryWithStore } = require( 'react-router-redux' );
const { match } = require( 'react-router' );
const { ReduxAsyncConnect, loadOnServer } = require( 'redux-connect' );
const createRoutes = require( './react/createRoutes' );
const editRoutes = require( './react/editRoutes' );

let service, config;
let agendasSvc;

module.exports = {
  init,
  matchApp,
  create,
  get,
  set,
  setImage,
  clearImage,
  removeAgenda,
  slugs: {
    available: slugAvailable
  }
};

function init( s, c ) {

  service = s;
  config = c;

  if ( c.logger ) {

    logs.setModuleConfig( c.logger );

  }

  agendasSvc = config.services.agendas;

}

function matchApp( appName, params, path, cb ) {

  return ( req, res, next ) => {

    const url = req.originalUrl.split( '?' )[ 0 ];
    const client = new ApiClient( params.state.settings.apiRoot, req );
    const memoryHistory = createHistory( url );
    const store = createStore( memoryHistory, client, params.state );
    const history = syncHistoryWithStore( memoryHistory, store );

    match( {
        history,
        routes: ({ edit: editRoutes, create: createRoutes })[ appName ]( store ),
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

            const component = React.createElement(
              Provider,
              { store, key: 'provider' },
              React.createElement( ReduxAsyncConnect, renderProps )
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

}

function create( req, res, next ) {

  agendasSvc.set( Object.assign( req.body, { ownerId: req.user.id } ), { private: null }, ( err, result ) => {

    if ( err ) return next( err );

    if ( result.errors.length ) res.status( 400 );

    return res.json( result );

  } );

}

function get( req, res, next ) {

  agendasSvc.get( { uid: req.params.uid }, { includeImagePath: true, private: null, internal: true }, ( err, result ) => {

    if ( err ) return next( err );

    return res.json( result );

  } );

}

function set( req, res, next ) {

  agendasSvc.set(
    { slug: req.params.slug },
    req.body,
    {
      includeImagePath: true,
      private: null,
      context: req.context || null,
      internal: true
    }, ( err, result ) => {

      if ( err ) return next( err );

      if ( result.errors.length ) res.status( 400 );

      return res.json( result );

    } );

}

function setImage( req, res, next ) {

  agendasSvc.get( { slug: req.params.slug }, { instanciate: true, private: null }, ( err, result ) => {

    if ( err ) return next( err );

    mwUploadImage( {
      dest: '/var/tmp',
      handler: ( tmpPath, info, cb ) => {

        result.setImage( { path: tmpPath }, ( err, paths ) => {

          if ( err ) return cb( err );

          cb( null, paths[ 0 ] );

        } );

      }
    } )( req, res, next );

  } );

}

function clearImage( req, res, next ) {

  agendasSvc.get( { slug: req.params.slug }, { instanciate: true, private: null }, ( err, result ) => {

    if ( err ) return next( err );

    result.clearImage( err => {

      if ( err ) next( err );

      res.json();

    } );

  } );

}

function removeAgenda( req, res, next ) {

  agendasSvc.remove( { slug: req.params.slug }, ( err, result ) => {

    if ( err ) return next( err );

    if ( !result.success ) res.status( 400 ).send();

    next();

  } );

}

function slugAvailable( req, res, next ) {

  agendasSvc.slugs.isTaken( req.body.slug, { excludeUid: req.body.excludeUid || false }, ( err, result ) => {

    if ( err ) return next( err );

    if ( result.taken ) {

      result.errors.push( {
        field: 'slug',
        code: 'duplicate',
        message: 'duplicate value found',
        origin: req.body.slug
      } );

    }

    if ( result.errors.length ) res.status( 400 );

    return res.json( result );

  } );

}
