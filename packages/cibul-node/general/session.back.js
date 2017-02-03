"use strict";

const sessions = require( 'sessions' ),

  modLib = require( '../lib/moduleLib' ),

  agendas = require( 'agendas' ),

  cmn = require( '../lib/commons-app' ),

  stakeholders = require( 'agenda-stakeholders' ),

  credentialTypes = require( 'agenda-stakeholders/iso/credentialTypes' ),

  routes = {
    session: [ 'get', '/', [
      sessions.middleware.ifUnlogged( ( req, res, next ) => { res.send( null ) } ),
      sessions.middleware.load(),
      ( req, res, next ) => { req.query.detailed ? _loadDetailed( req, res, next ) : next() },
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

  agendas.get( { uid: req.params.agendaUid }, { internal : true }, ( err, agenda ) => {

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


// retrieve additional stuff related to current user session
function _loadDetailed( req, res, next ) {

  sessions.get( req, { detailed: true }, ( err, session ) => {

    stakeholders.user( session.id ).list( 0, 1000, ( err, items, total ) => {

      agendas.list( { ids: items.map( i => i.agendaId ) }, 0, 1000, ( err, agendas ) => {

        if ( err ) return next( err );

        req.user.agendas = items

          .filter( i => agendas.map( a => a.id ).indexOf( i.agendaId ) !== -1 )

          .map( i => {

            let agenda = agendas.filter( a => a.id === i.agendaId )[ 0 ];

            return {
              title: agenda.title,
              uid: agenda.uid,
              role: stakeholders.types.codes.get( i.credential )
            }

          } );

        next();

      } );

    } );

  } );

}