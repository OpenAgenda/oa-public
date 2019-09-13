"use strict";

const _ = require( 'lodash' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const method = require( '../../utils/method' );

schema.register( {
  number: validators.number
} );

module.exports = function get( config, identifiers, activityId, cb ) {

  const { service, knex } = config;
  const defaultHook = _.merge( {}, {
    data: {
      id: activityId
    }
  } );

  const promise = method( [
    {
      field: {
        name: 'id',
        schema: {
          type: 'number',
          optional: false
        }
      }
    }, {
      field: {
        name: 'actor'
      }
    }, {
      field: {
        name: 'verb'
      }
    }, {
      field: {
        name: 'object'
      }
    }, {
      field: {
        name: 'target'
      }
    }, {
      field: {
        name: 'store'
      }
    }, {
      field: {
        name: 'created_at',
        dataKey: 'createdAt'
      }
    }, {
      field: {
        name: 'updated_at',
        dataKey: 'updatedAt'
      }
    }
  ], ( hook, next ) => {

    const dataSchema = hook.fields.reduce( ( prev, field ) => {
      if ( !field.schema ) return prev;

      prev[ field.dataKey || field.name ] = field.schema;

      return prev;
    }, {} );

    const validate = schema( dataSchema );

    try {
      hook.data = validate( hook.data );
    } catch ( e ) {
      return next( e );
    }

    const columnToSelect = hook.fields.reduce( ( prev, field ) => {
      // if ( !params.internal && field.internal ) return prev;

      prev.push( (field.table ? `${field.table}.${field.name}` : field.name) + ` as ${field.dataKey || field.name}` );
      return prev;
    }, [] );

    const where = hook.fields.reduce( ( prev, field ) => {
      if ( !hook.data[ field.dataKey || field.name ] ) return prev;

      prev[ field.name ] = hook.data[ field.dataKey || field.name ];
      return prev;
    }, {} );

    const feedGetter = () => identifiers ? service.feed( identifiers ).get( { internal: true } ) : Promise.resolve();

    return feedGetter()
      .then( feed => {

        const request = knex( config.schemas.activity ).column( columnToSelect ).where( where ).limit( 1 );

        if ( feed ) {
          request.join(
            config.schemas.feed_activity,
            config.schemas.feed_activity + '.activity_id',
            config.schemas.activity + '.id'
          );
        }

        return request
          .then( rows => {

            if ( !rows.length ) {

              throw new Error( 'Activity doesn\'t exists' );

            }

            const activity = rows[ 0 ];

            activity.store = JSON.parse( activity.store );

            return Promise.resolve( activity );

          } );

      } );

  }, { defaultHook } );

  return promisePlusCb( promise, cb );

};
