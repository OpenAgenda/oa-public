"use strict";

const log = require( '@openagenda/logs' )( 'auth/comexposium' );

const modLib = require( '../lib/moduleLib' ),

  cmn = require( '../lib/commons-app' ),

  w = require( 'when' ),

  auth = require( './lib/auth' ),

  config = require( '../config' ),

  agendaSvc = require( '../services/agenda' ),

  sessions = require( '@openagenda/sessions' ),

  usersSvc = require( '@openagenda/users' ),

  routes = {

    comexposiumSignin: [ 'get', '/comex/signin', [
      sessions.middleware.ifLogged( cmn.redirectTo() ),
      comexposiumSignin
    ] ]

  };

module.exports = function( path ) {

  var router = modLib.Router( routes );

  log( 'initing' );

  router.pre( [
    cmn.https
  ] );

  return {
    load: router.load( path ),
    paths: modLib.getPaths( path, routes )
  }

}


function comexposiumSignin( req, res, next ) {

  if ( !req.query.login ) return next( 'login is missing' );

  if ( !req.query.password ) return next( 'password is missing' );

  w( {
    req: req,
    res: res,
    login: req.query.login,
    password: req.query.password,
    user: false, // user to be loaded
    agenda: false, // agenda to contribute to
    isContributor: false
  } )

  .then( _loadUser )

  .then( _verifyPassword )

  .then( _loadCurrentAgenda )

  .then( _checkIsContributor )

  .then( _makeContributorIfRequired )

  .then( auth.signin )

  .done( auth.done , next );

}


async function _loadUser( v ) {

  const user = await usersSvc.findOne( {
    query: { comexposiumId: v.login }
  } );

  if ( !user ) {
    throw new Error( 'user not found' );
  };

  v.user = user;

}

function _verifyPassword( v ) {

  if ( v.user.getStore().comex.password !== v.password ) {

    throw 'Invalid password';

  }

  return v;

}

function _loadCurrentAgenda( v ) {

  var d = w.defer();

  agendaSvc.get( { uid: config.comexposium.contributingAgendaUid }, ( err, agenda ) => {

    if ( err ) return d.reject( err );

    v.agenda = agenda;

    d.resolve( v );

  } );

  return d.promise;

}

function _checkIsContributor( v ) {

  var d = w.defer();

  v.agenda.isContributor( v.user, ( err, is ) => {

    if ( err ) return d.reject( err );

    v.isContributor = !!is;

    d.resolve( v );

  } );

  return d.promise;

}

function _makeContributorIfRequired( v ) {

  var d = w.defer();

  if ( v.isContributor ) return d.resolve();

  v.agenda.setContributor( v.user, ( err ) => {

    if ( err ) return d.reject( err );

    d.resolve( v )

  } );

  return d.promise;

}
