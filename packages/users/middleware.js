"use strict";

const _ = require( 'lodash' );
const errors = require( '@feathersjs/errors' );
const imageUploadMw = require( '@openagenda/image-upload/lib/middleware' );
const imageFiles = require( '@openagenda/image-files' );
const service = require( './index' );
const config = require( './config' );

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
      const data = {
        uid: _.get( req, namespaces.uid ),
        id: _.get( req, namespaces.id )
      };
      const fieldName = data.uid
        ? 'uid'
        : data.id
          ? 'id'
          : null;

      if ( !data[ fieldName ] ) {
        throw new errors.NotFound( `Id or uid is required for load user` );
      }

      const page = await service().find( {
        provider: 'rest',
        query: {
          [ fieldName ]: data[ fieldName ]
        }
      } );

      if ( page.data.length !== 1 ) {
        throw new errors.NotFound( `No user found for ${fieldName} '${data[ fieldName ]}'` );
      }

      _.set( req, namespaces.entity, page.data[ 0 ] );

      next();
    } );
  },

  setImageProfile( options ) {
    const params = _.merge( {
      namespaces: {
        uid: 'user.uid',
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
              { path }
            );

            _.set( req, params.namespaces.result, result );

            cb( result.uploadedPaths[ 0 ] );

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
        uid: 'user.uid'
      }
    }, options );

    return wrap( async ( req, res, next ) => {
      await service().clearImageProfile( _.get( req, params.namespaces.uid ) );

      next();
    } );
  }
};

/* Util */

function wrap( fn ) {
  return ( req, res, next ) => Promise.resolve( fn( req, res, next ) ).catch( next );
}

function _getFormats( name ) {
  return [ {
    name: name,
    format: { width: 600 }
  }, {
    name: name + '_o'
  }, {
    name: name + '_sm',
    format: { width: 300 }
  } ]
}
