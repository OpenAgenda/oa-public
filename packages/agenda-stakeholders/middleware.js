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
    remove,
    bulkCreate
  }

  function load( serviceNamespace = 'stakeholders' ) {

    return ( req, res, next ) => {

      _.set( req, serviceNamespace, service( _.get( req, namespace ).id ) );

      next();

    }

  }

  function remove( options ) {

    let { namespaces } = _.merge( {
      namespaces: {
        user: 'user',
        result: 'result'
      }
    }, options || {} );

    return ( req, res, next ) => {

      service.agenda( _.get( req, namespace ).id ).remove( { userId: _.get( req, namespaces.user ).id }, ( err, result ) => {

        if ( err ) return next( err );

        _.set( req, namespaces.result, result );

        next();

      } );

    }

  }

  function update( options ) {

    let { namespaces } = _.merge( {
      namespaces: {
        user: 'user',
        result: 'result',
        data: 'data' // the custom data only
      }
    }, options || {} );

    return ( req, res, next ) => {

      service.agenda( _.get( req, namespace ).id ).get( { userId: _.get( req, namespaces.user ).id }, { instanciate: true }, ( err, instance ) => {

        if ( err ) return next( err );

        if ( !instance ) return next( 'stakeholder not found' );

        instance.setFieldValues( _.get( req, namespaces.data ), ( err, result ) => {

          if ( err ) return next( err );

          _.set( req, namespaces.result, result );

          next();

        } );

      } );

    }

  }

  function get( options ) {

    let { namespaces } = _.merge( {
      namespaces: {
        user: 'user',
        stakeholder: 'stakeholder',
        instance: 'stakeholderInstance'
      }
    }, options || {} );

    return ( req, res, next ) => {

      service.agenda( _.get( req, namespace ).id ).get( { userId: _.get( req, namespaces.user ).id }, ( err, st ) => {

        if ( err ) return next( err );

        _.set( req, namespaces.stakeholder, st );

        _.set( req, namespaces.instance, new Stakeholder( _.mapKeys( st.custom, ( v, k ) => _.snakeCase( k ) ) ) );

        next();

      } ); 

    }

  }

  function bulkCreate( options ) {

    let { namespaces, allowPartial } = _.merge( {
      namespaces: {
        data: 'data',
        result: 'result'
      },
      allowPartial: false
    }, options || {} );

    return ( req, res, next ) => {

      const { stakeholders, crendential } = _.get( req, namespaces.data );

      service.agenda( _.get( req, namespace ).id )
        .create.bulk( stakeholders, { allowPartial, crendential }, ( err, result ) => {

        if ( err ) return next( err );

        _.set( req, namespaces.result, result );

        next();

      } );

    }

  }

  function stats( options ) {

    let { namespaces } = _.merge( {
      namespaces: {
        stats: 'stats'
      }
    }, options || {} );

    return ( req, res, next ) => {

      service.agenda( _.get( req, namespace ).id ).stats( ( err, stats ) => {

        if ( err ) return next( err );

        _.set( req, namespaces.stats, stats );

        next();

      } );

    }

  }

  function list( options ) {

    let { namespaces, limit, showSlugs } = _.merge( {
      namespaces: {
        query: 'query',
        stakeholders: 'stakeholders',
        total: 'total'
      },
      limit: 20,
      showSlugs: false
    }, options || {} );

    return ( req, res, next ) => {

      const offset = ( ( _.get( req, namespaces.query ).page || 1 ) - 1 ) * limit;

      service.agenda( _.get( req, namespace ).id ).list( _.get( req, namespaces.query ), offset, limit, {
        total: true,
        detailed: true,
        showSlugs
      }, ( err, items, total ) => {

        if ( err ) next( err );

        _.set( req, namespaces.stakeholders, items );
        _.set( req, namespaces.total, total );

        next();

      } );

    }

  }

}