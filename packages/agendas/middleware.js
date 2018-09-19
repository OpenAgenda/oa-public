"use strict";

const _ = require( 'lodash' );

let service, config;

module.exports = {
  init,
  load,
  evaluateIPAddress,
  loadRoles
}

function evaluateIPAddress( options ) {

  const params = _.merge( {
    namespaces: {
      agenda: 'agenda' // loaded agenda
    },
    onUnauthorizedIPAddress: ( req, res, next ) => { next( { code: 403 } ) }
  }, options || {} );

  return ( req, res, next ) => {

    // annoying. when evaluating an instance, data is in .data
    const data = req[ params.namespaces.agenda ].data || req[ params.namespaces.agenda ];

    const authorizedIPs = data.settings.contribution.authorizedIPAddresses;

    if ( !authorizedIPs || !authorizedIPs.length ) {

      return next();

    }

    const IP = ( req.header( 'x-forwarded-for' ) || '' ).split( ', ' )[ 0 ];

    if ( authorizedIPs.includes( IP ) ) {

      return next();

    }

    params.onUnauthorizedIPAddress( req, res, next );

  }

}

function load( options ) {

  const params = _.merge( {
    instanciate: false,
    detailed: false,
    internal: false,
    private: false,
    namespaces: {
      identifiers: {
        id: 'agendaId',
        uid: 'agendaUid',
        slug: 'agendaSlug',
      },
      result: 'agenda'
    }
  }, options || {} );

  return ( req, res, next ) => {

    const identifiers = _getIdentifiers( params.namespaces.identifiers, req );

    service.get( identifiers, _.pick( params, [ 'instanciate', 'detailed', 'internal', 'private' ] ),
      ( err, agenda ) => {

        if ( err ) return next( err );

        _.set( req, params.namespaces.result, agenda );

        next();

      } );

  }

}

function loadRoles( options ) {

  let  params = _.merge( {
    namespaces: {
      agenda: 'agenda',
      result: 'agendaRoles'
    },
    private: false
  }, options || {} );

  let { namespaces } = params;

  return ( req, res, next ) => {

    const agenda = _.get( req, namespaces.agenda );

    const _getRoles = instance => instance.getRoles( ( err, roles ) => {

      if ( err ) return next( err );

      _.set( req, namespaces.result, roles );

      next();

    } );

    if ( agenda instanceof service.Agenda ) {

      return _getRoles( agenda );

    }

    const identifierNamespaces = _getIdentifiers( {
      id: namespaces.agenda + '.id',
      uid: namespaces.agenda + '.uid',
      slug: namespaces.agenda + '.slug'
    }, req );

    service.get( identifierNamespaces, { instanciate: true, private: params.private }, ( err, agenda ) => {

      if ( err ) return next( err );

      return _getRoles( agenda );

    } );

  }

}

function init( c, svc ) {

  service = svc;
  config = c;

}

function _getIdentifiers( namespaces, req ) {

  let identifiers = {};

  _.forIn( namespaces, ( v, k ) => {

    if ( !v ) return;

    identifiers[ k ] = _.get( req, v );

  } );

  return identifiers;

}
