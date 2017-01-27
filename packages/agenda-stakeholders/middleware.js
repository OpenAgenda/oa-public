"use strict";

const _ = require( 'lodash' );
const service = require( './service' );
const Stakeholder = require( './iso/Stakeholder' );

module.exports = {
  loadAgenda,
  load
}

module.exports = {
  agenda
}

function agenda( namespace = 'agenda' ) {

  return {
    load
  }

  function load( options ) {

    let { namespaces } = _.extend( {
      namespaces: {
        user: 'user',
        stakeholder: 'stakeholder',
        instance: 'stakeholderInstance'
      }
    }, options || {} );

    return ( req, res, next ) => {

      service( req[ namespace ].id ).get( { userId: req[ namespaces.user ].id }, ( err, st ) => {

        if ( err ) return next( err );

        req[ namespaces.stakeholder ] = st;

        req[ namespaces.instance ] = new Stakeholder( _.mapKeys( st.custom, ( v, k ) => _.snakeCase( k ) ) );

        next();

      } ); 

    }

  }

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



/*
function list( req, res ) {

  const offset = (req.query.page - 1) * config.limit;
  const limit = config.limit;

  const query = {
    search: req.query.search,
    credentials: req.query.credentials
  };

  service( req.agenda.id )
    .list( query, offset, limit, { total: true, detailed: true }, ( err, stakeholders, total ) => {

      if ( err ) return res.status( 400 ).send( err );

      res.send( { stakeholders, total } );

    } );

}

function stats( req, res ) {

  service( req.agenda.id )
    .stats( ( err, stats ) => {

      if ( err ) return res.status( 400 ).send( err );

      res.send( { stats } );

    } );

} */