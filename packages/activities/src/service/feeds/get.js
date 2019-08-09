"use strict";

const _ = require( 'lodash' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const method = require( '../../utils/method' );

const FEED_TYPES = require( '../feedTypes' );

schema.register( {
  choice: validators.choice,
  number: validators.number
} );

module.exports = get;

function parseArguments( identifiers, options, cb ) {

  const result = {
    identifiers,
    options,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 2 ) {

    Object.assign( result, {
      identifiers: args[ 0 ],
      options: {},
      cb: args[ 1 ]
    } );

  }

  return result;

}

function get( config ) {

  const { knex } = config;

  const {
    identifiers,
    options,
    cb
  } = parseArguments.apply( null, Array.prototype.slice.call(arguments, 1) );

  const {
    entityType,
    entityUid,
    id
  } = identifiers;

  const params = _.merge( {
    internal: false,
    followed: false,
    followedBy: false
  }, options );

  const defaultHook = _.merge( {}, {
    data: {
      entityType,
      entityUid,
      id
    }
  } );

  const promise = method( [
    {
      field: {
        name: 'id',
        internal: true
      },
      before: ( field, fields, hook, next ) => {
        if ( hook.data.id ) {
          field.schema = {
            type: 'number',
            optional: false
          };
        }

        next();
      }
    },
    {
      field: {
        name: 'entity_type',
        dataKey: 'entityType'
      },
      before: ( field, fields, hook, next ) => {
        if ( !hook.data.id ) {
          field.schema = {
            type: 'choice',
            options: FEED_TYPES,
            unique: true,
            optional: false
          };
        }

        next();
      }
    }, {
      field: {
        name: 'entity_uid',
        dataKey: 'entityUid'
      },
      before: ( field, fields, hook, next ) => {
        if ( !hook.data.id ) {
          field.schema = {
            type: 'number',
            optional: false
          };
        }

        next();
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
      if ( !params.internal && field.internal ) return prev;

      prev.push( (field.table ? `${field.table}.${field.name}` : field.name) + ` as ${field.dataKey || field.name}` );
      return prev;
    }, [] );

    if ( !params.internal && (params.followed || params.followedBy) ) {
      columnToSelect.push( 'id' );
    }

    const where = hook.fields.reduce( ( prev, field ) => {
      if ( !hook.data[ field.dataKey || field.name ] ) return prev;

      prev[ field.name ] = hook.data[ field.dataKey || field.name ];
      return prev;
    }, {} );

    return knex( config.schemas.feed ).first( columnToSelect ).where( where )

      .then( feed => {

        if ( !feed || !params.followed ) return feed;

        return knex( config.schemas.feed_follow ).select().where( { target_feed: feed.id } )
          .then( rows => {

            feed.followed = rows.map( row => {
              const mappedFeed = _.mapKeys( row, ( v, k ) => _.camelCase( k ) );
              mappedFeed.store = JSON.parse( mappedFeed.store || '{}' );
              return mappedFeed;
            } );

            return feed;

          } );

      } )
      .then( feed => {

        if ( !feed || !params.followedBy ) return feed;

        return knex( config.schemas.feed_follow ).select().where( { origin_feed: feed.id } )
          .then( rows => {

            feed.followedBy = rows.map( row => {
              const mappedFeed = _.mapKeys( row, ( v, k ) => _.camelCase( k ) );
              mappedFeed.store = JSON.parse( mappedFeed.store || '{}' );
              return mappedFeed;
            } );

            return feed;

          } );

      } )
      .then( feed => {

        if ( !feed ) return null;

        if ( !params.internal && (params.followed || params.followedBy) ) {
          feed = _.omit( feed, 'id' );
        }

        return feed;

      } );

  }, { defaultHook } );

  return promisePlusCb( promise, cb );

}
