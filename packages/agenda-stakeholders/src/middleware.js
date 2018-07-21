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
    bulk,
    message
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
        identifiers: 'identifiers',
        user: 'user',
        result: 'result'
      }
    }, options || {} );

    return ( req, res, next ) => {

      let identifiers = _.get( req, namespaces.identifiers );

      if ( !identifiers ) {

        console.log( 'DEPRECATED: Use identifiers namespace instead of user in .remove middleware (agenda-stakeholders)' );
        identifiers = { userId: _.get( req, namespaces.user ).id };

      }

      service.agenda( _.get( req, namespace ).id ).remove( identifiers, ( err, result ) => {

        if ( err ) return next( err );

        _.set( req, namespaces.result, result );

        next();

      } );

    }

  }

  function update( options ) {

    let { namespaces, credential, allowPartial } = _.merge( {
      credential: false, // allow credential update
      allowPartial: false, // allow partial update
      namespaces: {
        identifiers: 'identifiers',
        user: 'user',
        result: 'result',
        data: 'data', // the custom data only
        context: 'context'
      }
    }, options || {} );

    return ( req, res, next ) => {

      let identifiers = _.get( req, namespaces.identifiers );

      if ( !identifiers ) {

        console.log( 'DEPRECATED: Use identifiers namespace instead of user in .update middleware (agenda-stakeholders)' );
        identifiers = { userId: _.get( req, namespaces.user ).id };

      }

      service.agenda( _.get( req, namespace ).id ).update( identifiers, _.get( req, namespaces.data ).fieldValues, {
        credential: credential ? _.get( req, namespaces.data ).credential : null,
        allowPartial,
        context: _.get( req, namespaces.context, null )
      }, ( err, result ) => {

        if ( err ) return next( err );

        let mwResult = {
          success: result.success,
          valid: result.valid,
          errors: result.errors,
          fieldValues: result.stakeholder ? result.stakeholder.custom : null
        };

        if ( credential ) {

          mwResult.credential = result.stakeholder ? result.stakeholder.credential : null;

        }

        _.set( req, namespaces.result, mwResult );

        next();

      } );

    }

  }

  function get( options ) {

    let { namespaces, options: getOptions } = _.merge( {
      namespaces: {
        identifiers: 'identifiers',
        user: 'user',
        stakeholder: 'stakeholder',
        instance: 'stakeholderInstance'
      },
      options: {}
    }, options || {} );

    return ( req, res, next ) => {

      let identifiers = _.get( req, namespaces.identifiers );

      if ( !identifiers ) {

        console.log( 'DEPRECATED: Use identifiers namespace instead of user in .get middleware (agenda-stakeholders)' );
        identifiers = { userId: _.get( req, namespaces.user ).id };

      }

      service.agenda( _.get( req, namespace ).id ).get( identifiers, getOptions, ( err, st ) => {

        if ( err ) return next( err );

        _.set( req, namespaces.stakeholder, st );

        if ( !st ) return next();

        _.set( req, namespaces.instance, new Stakeholder( _.mapKeys( st.custom, ( v, k ) => _.snakeCase( k ) ) ) );

        next();

      } );

    }

  }

  function bulk( options ) {

    let { namespaces, allowPartial } = _.merge( {
      namespaces: {
        data: 'data',
        result: 'result',
        context: 'context'
      },
      allowPartial: false
    }, options || {} );

    return ( req, res, next ) => {

      const { stakeholders, credential } = _.get( req, namespaces.data );

      service.agenda( _.get( req, namespace ).id )

        .bulk( stakeholders, {
          allowPartial,
          credential,
          context: _.get( req, namespaces.context, null )
        }, ( err, result ) => {

          if ( err ) return next( err );

          _.set( req, namespaces.result, result );

          next();

        } );

    }

  }

  function message( options ) {

    let { namespaces, actionsCounterEqualZero, deletedUser, id, userId, invited } = _.merge( {
      namespaces: {
        message: 'message',
        result: 'result',
        context: 'context',
        query: 'query'
      },
      actionsCounterEqualZero: null,
      invited: null,
      deletedUser: false,
      id: undefined,
      userId: undefined
    }, options || {} );

    return ( req, res, next ) => {

      const query = _.pick( _.get( req, namespaces.query, {} ), [ 'search', 'credential' ] );

      service.agenda( _.get( req, namespace ).id )

        .message(
          Object.assign( {}, query, { actionsCounterEqualZero, deletedUser, id, userId, invited } ),
          _.get( req, namespaces.message, '' ),
          _.get( req, namespaces.context, null ),
          ( err, result ) => {

            if ( err ) return next( err );

            _.set( req, namespaces.result, result );

            next();

          } );

    }

  }

  function stats( options ) {

    let { namespaces } = _.merge( {
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

    let { namespaces, limit, showSlugs, detailed, total } = _.merge( {
      namespaces: {
        query: 'query',
        stakeholders: 'stakeholders',
        total: 'total'
      },
      detailed: false,
      limit: 20,
      showSlugs: false,
      total: false
    }, options || {} );

    return ( req, res, next ) => {

      const offset = ( ( _.get( req, namespaces.query ).page || 1 ) - 1 ) * limit;

      service.agenda( _.get( req, namespace ).id ).list( _.get( req, namespaces.query ), offset, limit, {
        total,
        detailed,
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
