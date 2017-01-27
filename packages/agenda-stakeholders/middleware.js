"use strict";

const _ = require( 'lodash' );
const service = require( './service' );
const Stakeholder = require( './iso/Stakeholder' );

module.exports = {
  agenda
}

function agenda( namespace = 'agenda' ) {

  return {
    load,
    get,
    list,
    stats,
    update,
    remove
  }

  function load( serviceNamespace = 'stakeholders' ) {

    return ( req, res, next ) => {

      req[ serviceNamespace ] = service( req[ namespace ].id );

      next();

    }

  }

  function remove( options ) {

    let { namespaces } = _.extend( {
      namespaces: {
        stakeholder: 'stakeholder',
        result: 'result'
      }
    }, options || {} );

    return ( req, res, next ) => {

      service.agenda( req[ namespace ].id ).remove( { id: req[ namespaces.stakeholder ].id }, ( err, result ) => {

        if ( err ) return next( err );

        req[ namespaces.result ] = result;

        next();

      } );

    }

  }

  function update( options ) {

    let { namespaces } = _.extend( {
      namespaces: {
        user: 'user',
        result: 'result',
        data: 'data' // the custom data only
      }
    }, options || {} );

    return ( req, res, next ) => {

      service.agenda( req[ namespace ].id ).get( { userId: req[ namespaces.user ].id }, { instanciate: true }, ( err, instance ) => {

        if ( err ) return next( err );

        instance.setFieldValues( req[ namespaces.data ], ( err, result ) => {

          if ( err ) return next( err );

          req[ namespaces.result ] = result;

          next();

        } );

      } );

    }

  }

  function get( options ) {

    let { namespaces } = _.extend( {
      namespaces: {
        user: 'user',
        stakeholder: 'stakeholder',
        instance: 'stakeholderInstance'
      }
    }, options || {} );

    return ( req, res, next ) => {

      service.agenda( req[ namespace ].id ).get( { userId: req[ namespaces.user ].id }, ( err, st ) => {

        if ( err ) return next( err );

        req[ namespaces.stakeholder ] = st;

        req[ namespaces.instance ] = new Stakeholder( _.mapKeys( st.custom, ( v, k ) => _.snakeCase( k ) ) );

        next();

      } ); 

    }

  }

  function stats( options ) {

    let { namespaces } = _.extend( {
      namespaces: {
        stats: 'stats'
      }
    }, options || {} );

    return ( req, res, next ) => {

      service.agenda( req[ namespace ].id ).stats( ( err, stats ) => {

        if ( err ) return next( err );

        req[ namespaces.stats ] = stats;

        next();

      } );

    }

  }

  function list( options ) {

    let { namespaces, limit } = _.extend( {
      namespaces: {
        query: 'query',
        stakeholders: 'stakeholders',
        total: 'total'
      },
      limit: 20
    }, options || {} );

    return ( req, res, next ) => {

      const offset = ( ( req[ namespaces.query ].page || 1 ) - 1 ) * limit;

      service.agenda( req[ namespace ].id ).list( req[ namespaces.query ], offset, limit, {
        total: true,
        detailed: true
      }, ( err, items, total ) => {

        if ( err ) next( err );

        req[ namespaces.stakeholders ] = items;
        req[ namespaces.total ] = total;

        next();

      } );

    }

  }

}