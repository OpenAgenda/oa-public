"use strict";

const _ = require( 'lodash' );
const errors = require( '@feathersjs/errors' );
const service = require( './' );

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
  }
};

/* Util */

function wrap( fn ) {
  return ( req, res, next ) => fn( req, res, next ).catch( next );
}
