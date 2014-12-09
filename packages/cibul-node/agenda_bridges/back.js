/**
 * load libraries and define app module routes
 */

var appName = 'agenda_bridges/back',

exposed = {
  load: load
},

routes = {
  serviceIndex: [ 'get', serviceIndex, '/:service' ],
  connectService: [ 'get', connectService, '/:service/connect' ],
  serviceSynchronize: [ 'get', serviceSynchronize, '/:service/synchronize' ],
  serviceUnlink: [ 'get', serviceUnlink, '/:service/unlink' ]
},

log = require( '../lib/logger' )( appName ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../lib/lib' ), 

cmn = require( '../lib/commons-app' ),

config = require( '../config' ),

app,

path,

model = cmn.getCibulModel();

module.exports = function( p ) {

  log( 'initing' );

  path = p;

  cmn.registerRoutes( appName, path, routes);

  return exposed;

}


function load( main ) {

  if ( app ) {

    log( 'this app has already been loaded');

    return;

  }

  log( 'loading' );

  app = cmn.loadApp( main, path, appName );

  app.use( require( 'body-parser' ).urlencoded( { extended: true } ) );

  // load agenda matching route :slug in req.agenda

  cmn.loadRoutes( app, routes, [
    cmn.urlGenSetter( appName, path ),
    cmn.loadAgenda( 'slug' ),
    cmn.flashSetter,
    cmn.loadSession,
    cmn.loadBaseData( _layoutData ),
    cmn.requireLogged,
    cmn.checkAdministrator,
    _loadService
  ] );

  return exposed;

}

function serviceIndex( req, res ) {

  var isLinked = false;

  if ( req.agenda.getStore( req.params.service, null ) ) isLinked = true;

  cmn.render( req, res, req.params.service + '/index', lib.extend( { linked: isLinked }, req.baseData ) );

}

function connectService( req, res ) {

  log( 'request received for controller linkService with %s service', req.params.service );

  return req.service.connectService( req, res );

}

function serviceSynchronize( req, res ) {

  var code = req.query.code;

  wn.call( req.service.getAccessToken, req.agenda.slug, req.query.code, 'authorization_code' )

  .spread( function( access, refresh ) {

    var tokens = {
      access: access,
      refresh: refresh
    };

    return wn.call( req.agenda.setStore, req.params.service, JSON.stringify( tokens ), true );

  } )

  .then( function() {

    cmn.redirect( req, res, 'serviceIndex', { service: req.params.service }, 'Your swapcard events are being updated' );

    return wn.call( req.service.processEvents, req.agenda, 'publish' );

  } )

  .catch( _error( req, res ) );

}

function serviceUnlink( req, res ) {

  wn.call( req.agenda.removeStore, 'swapcard', true )

  .then( function( ) {

    cmn.redirect( req, res, 'serviceIndex', { service: req.params.service }, 'Your swapcard events are now being unlinked' )

    return wn.call( req.service.unlinkEvents, req.agenda );

  } )

  .catch( _error( req, res ) );

}


function _loadService( req, res, next ) {

  var service = req.params.service;

  if ( !config.bridges[ service ] ) {

    return redirect( req, res, 'agendaAdminShow', { slug: req.agenda.slug }, 'This service does not exist' );

  }

  req.service = require( '../services/' + service + '/' + service )( model, config );

  next();

}


function _error( req, res ) {

  return function( err ) {

    if ( typeof err === 'string' ) err = { message: err };

    var link = false;

    if ( req.agenda ) {

      err.link = {
        uri: 'serviceIndex',
        values: { service: req.params.service },
        label: 'go back to ' + req.params.service + ' page'
      };

    }

    cmn.errorResponse( req, res, err );

  };

}

function _layoutData( req, res ) {
  
  return {
    tab: req.params.service,
    mainClass: req.params.service,
    agenda: {
      title: req.agenda.title,
      description: req.agenda.description,
      url: req.agenda.url,
      image: req.agenda.getImage( true )
    }
  };
}
