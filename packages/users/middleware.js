"use strict";

const _ = require( 'lodash' );
const errors = require( '@feathersjs/errors' );
const imageUploadMw = require( '@openagenda/image-upload/lib/middleware' );
const log = require( '@openagenda/logs' )( 'users/middleware' );
const service = require( './index' );
const config = require( './config' );


function wrap( fn ) {
  return ( req, res, next ) => Promise.resolve( fn( req, res, next ) ).catch( next );
}


module.exports = {
  load( options ) {
    const { namespaces } = _.merge( {
      namespaces: {
        uid: 'user.uid',
        id: 'user.id',
        entity: 'user'
      }
    }, options );

    return wrap( async ( req, res, next ) => {
      const identifier = getIdentifier( req, namespaces );

      const user = await service().findOne( {
        provider: 'rest',
        query: _.clone( identifier ),
        user: req.user,
        authenticated: req.authenticated
      } );

      if ( !user ) {
        throw new errors.NotFound( `No user found for ${JSON.stringify( identifier )}` );
      }

      _.set( req, namespaces.entity, user );

      next();
    } );
  },

  setImageProfile( options ) {
    const params = _.merge( {
      namespaces: {
        uid: 'params.__feathersId',
        query: 'query',
        result: 'result'
      }
    }, options );

    return wrap( ( req, res, next ) => {

      imageUploadMw( {
        dest: config.files.tmpPath,
        handler: async ( path, info, cb ) => {

          try {

            const result = await service().setImageProfile(
              _.get( req, params.namespaces.uid ),
              { path },
              {
                provider: 'rest',
                query: _.cloneDeep( _.get( req, params.namespaces.query ) ),
                user: req.user,
                authenticated: req.authenticated
              }
            );

            res.data = result;
            _.set( req, params.namespaces.result, result );

            cb( null, result.uploadedPaths[ 0 ] );

          } catch ( e ) {

            cb( e );

          }

        }
      } )( req, res, next );

    } );
  },

  clearImageProfile( options ) {
    const params = _.merge( {
      namespaces: {
        uid: 'params.__feathersId',
        query: 'query',
        result: 'result'
      }
    }, options );

    return methodToMiddleware( 'clearImageProfile', params, false );
  },

  requestChangeEmail( options ) {
    const params = _.merge( {
      namespaces: {
        uid: 'params.__feathersId',
        data: 'body',
        query: 'query',
        result: 'result'
      }
    }, options );

    return methodToMiddleware( 'requestChangeEmail', params );
  },

  confirmChangeEmail( options ) {
    const params = _.merge( {
      namespaces: {
        uid: 'params.__feathersId',
        query: 'query',
        result: 'result'
      }
    }, options );

    return methodToMiddleware( 'confirmChangeEmail', params, false );
  },

  changePassword( options ) {
    const params = _.merge( {
      namespaces: {
        uid: 'params.__feathersId',
        data: 'body',
        query: 'query',
        result: 'result'
      }
    }, options );

    return methodToMiddleware( 'changePassword', params );
  },

  generateApiKey( options ) {
    const params = _.merge( {
      namespaces: {
        uid: 'params.__feathersId',
        query: 'query',
        result: 'result'
      }
    }, options );

    return methodToMiddleware( 'generateApiKey', params, false );
  },

  setNewFlag( options ) {
    const params = _.merge( {
      namespaces: {
        uid: 'params.__feathersId',
        data: 'body',
        query: 'query',
        result: 'result'
      }
    }, options );

    return methodToMiddleware( 'setNewFlag', params );
  },

  refresh( options ) {
    const params = _.merge( {
      namespaces: {
        uid: 'params.__feathersId',
        data: 'body',
        query: 'query',
        result: 'result'
      }
    }, options );

    return methodToMiddleware( 'refresh', params );
  }
};

/* Util */

function getIdentifier( req, namespaces ) {
  const data = {
    uid: _.get( req, namespaces.uid ),
    id: _.get( req, namespaces.id )
  };
  const fieldName = data.uid
    ? 'uid'
    : data.id
      ? 'id'
      : null;

  if ( !fieldName || !data[ fieldName ] ) {
    throw new errors.NotFound( `Id or uid is required for load user` );
  }

  return { [ fieldName ]: data[ fieldName ] };
}

function methodToMiddleware( method, params, withData = true ) {
  return wrap( async ( req, res, next ) => {
    const args = [
      _.get( req, params.namespaces.uid ),
      ...(withData ? [ _.cloneDeep( _.get( req, params.namespaces.data ) ) ] : []),
      {
        provider: 'rest',
        query: _.cloneDeep( _.get( req, params.namespaces.query ) ),
        user: req.user,
        authenticated: req.authenticated
      }
    ];

    const _service = service();

    const result = await _service[ method ].apply( _service, args );

    res.data = result;
    _.set( req, params.namespaces.result, result );

    next();
  } );
}
