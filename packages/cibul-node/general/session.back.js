"use strict";

const sessions = require( 'sessions' ),

  modLib = require( '../lib/moduleLib' ),

  agendaSvc = require( 'agendas' ),

  cmn = require( '../lib/commons-app' ),

  stakeholders = require( 'agenda-stakeholders' ),

  credentialTypes = require( 'agenda-stakeholders/iso/credentialTypes' ),

  routes = {
    session: [ 'get', '/', [
      sessions.middleware.ifUnlogged( ( req, res, next ) => { res.send( null ) } ),
      sessions.middleware.load(),
      ( req, res, next ) => { res.send( req.user ); } 
    ] ],
    sessionMemberRole: [ 'get', '/agendas/:agendaUid/role', [
      agendaLoad,
      sessions.middleware.load( { detailed: true } ),
      role
    ] ]
  };

module.exports = p => {

  let router = modLib.Router( routes );

  router.pre( [
    cmn.loadLogger( 'session' )
  ] );

  return {
    load: router.load( p ),
    paths: modLib.getPaths( p, routes )
  }

}

// agendas service middleware will replace this
// middleware from service/agenda/middleware
function agendaLoad( req, res, next ) {

  agendaSvc.get( { uid: req.params.agendaUid }, { internal : true }, ( err, agenda ) => {

    if ( err ) return next( err );

    req.agendaRef = agenda;

    next();

  } );

}


function role( req, res, next ) {

  if ( !req.agendaRef || !req.user ) {

    return res.send( null );

  }

  stakeholders.agenda( req.agendaRef.id ).get( { userId: req.user.id }, ( err, result ) => {

    res.send( result ? credentialTypes.codes.get( result.credential ) : null );

  } );

}