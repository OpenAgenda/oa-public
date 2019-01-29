"use strict";

const sessions = require( '@openagenda/sessions' );
const agendas = require( '@openagenda/agendas' );
const stakeholders = require( '@openagenda/agenda-stakeholders' );
const credentialTypes = require( '@openagenda/agenda-stakeholders/dist/iso/credentialTypes' );
const cmn = require( '../lib/commons-app' );

const preMw = [
  cmn.loadLogger( 'session' )
];


module.exports = app => {

  app.get(
    '/session',
    preMw,
    sessions.middleware.ifUnlogged( ( req, res ) => res.send( null ) ),
    ( req, res, next ) => { req.query.detailed ? _loadDetailed( req, res, next ) : next() },
    ( req, res ) => res.send( req.user )
  );

  app.get(
    '/session/agendas/:agendaUid/role',
    preMw,
    agendaLoad,
    role
  );

};


// agendas service middleware will replace this
// middleware from service/agenda/middleware
function agendaLoad( req, res, next ) {

  agendas.get( { uid: req.params.agendaUid }, { internal : true, private: null }, ( err, agenda ) => {

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

      if ( err ) return next( err );

      agendas.list( { ids: items.map( i => i.agendaId ) }, 0, 1000, { private: null }, ( err, agendas ) => {

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
