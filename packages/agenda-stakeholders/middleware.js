"use strict";

const _ = require( 'lodash' );
const service = require( './service' );

module.exports = {
  loadAgenda,
  load
}

function loadAgenda( agendaNamespace, serviceNamespace ) {

  return ( req, res, next ) => {

    req[ serviceNamespace ] = service( req[ agendaNamespace ].id );

    next();

  }

}


function load( agendaNamespace, userNamespace, stakeholderNamespace ) {

  agendaNamespace = agendaNamespace || 'agenda';

  userNamespace = userNamespace || 'user';

  stakeholderNamespace = stakeholderNamespace || 'stakeholder';

  return ( req, res, next ) => {

    let agendaStakeholders = service( req[ agendaNamespace ].id );    

    agendaStakeholders.get( { userId: req.user.id }, ( err, st ) => {

      if ( err ) return next( err );

      req[ stakeholderNamespace ] = st;

      next();

    } );

  }

}