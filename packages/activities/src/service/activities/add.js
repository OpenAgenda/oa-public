"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const VError = require( 'verror' );
const nodefn = require( 'when/node' );
const promisePlusCb = require( '@openagenda/service-utils/promisePlusCb' );
const schema = require( '@openagenda/validators/schema' );
const validators = require( '@openagenda/validators' );
const method = require( '../../utils/method' );

schema.register( {
  text: validators.text,
  pass: validators.pass
} );

module.exports = add;

function parseArguments( identifiers, data, feedsIdentifiers, cb ) {

  const result = {
    identifiers,
    data,
    feedsIdentifiers,
    cb
  };

  const args = Array.isArray( arguments ) ? arguments : Array.from( arguments );

  if ( typeof args[ args.length - 1 ] !== 'function' ) {
    args.push( null );
  }

  if ( args.length === 3 ) {

    Object.assign( result, {
      identifiers: args[ 0 ],
      data: args[ 1 ],
      feedsIdentifiers: null,
      cb: args[ 2 ]
    } );

  }

  return result;

}

function add( config ) {

  const { service, knex } = config;

  const {
    identifiers,
    data,
    feedsIdentifiers,
    cb
  } = parseArguments.apply( null, Array.prototype.slice.call(arguments, 1) );

  const defaultHook = _.merge( {}, {
    data
  } );

  const promise = method( [
    {
      field: {
        name: 'actor',
        schema: {
          type: 'text',
          max: 255,
          optional: false
        }
      }
    }, {
      field: {
        name: 'verb',
        schema: {
          type: 'text',
          max: 255,
          optional: false
        }
      }
    }, {
      field: {
        name: 'object',
        schema: {
          type: 'text',
          max: 255,
          optional: true
        }
      }
    }, {
      field: {
        name: 'target',
        schema: {
          type: 'text',
          max: 255,
          optional: true
        }
      }
    }, {
      field: {
        name: 'store',
        schema: {
          type: 'pass',
          optional: true
        }
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

    hook.data.store = JSON.stringify( hook.data.store || {} );

    const fields = hook.fields.reduce( ( prev, field ) => {
      if ( !hook.data[ field.dataKey || field.name ] ) return prev;

      prev[ field.name ] = hook.data[ field.dataKey || field.name ];
      return prev;
    }, {} );

    const feedsToGet = (identifiers ? [ identifiers ] : []).concat( feedsIdentifiers || [] );

    return nodefn.call( async.mapSeries,
      feedsToGet,
      ( item, mcb ) => service.feed( item ).get( {
        internal: true,
        followedBy: true
      }, mcb ) )
      .then( feeds => {

        if ( !feeds.length ) {
          throw new Error( 'You should choose at least one feed for add activity' );
        }

        if ( feeds.filter( v => !v ).length ) {
          throw new VError( 'One or more feeds doesn\'t exist in feeds %j', feedsToGet );
        }

        return knex( config.schemas.activity ).insert( fields )
          .then( ( [ activityId ] ) => {

            return service.activities.get( activityId );

          } )
          .then( activity => {

            const feedContainsActivity = [];
            let followers = feeds.map( v => ({ targetFeed: v.id }) )
              .concat( ...feeds.map( v => v.followedBy ) );

            return nodefn.call( async.whilst,
              () => followers.length,
              wcb => {

                async.eachSeries( followers, ( follower, ecb ) => {

                  if ( ~feedContainsActivity.findIndex( v => v.targetFeed === follower.targetFeed ) ) {
                    followers = followers.filter( v => v.targetFeed !== follower.targetFeed );
                    return ecb();
                  }


                  let filterFollows = [];

                  if ( follower.id && config.filterFollows ) {
                    filterFollows = config.filterFollows.filter( v => ~[].concat( v.verb ).indexOf( activity.verb ) );
                  }

                  ( filterFollows.some( v => v.getFeeds ) ?
                    Promise.all( [
                      service.feed( follower.originFeed ).get( { internal: true } ),
                      service.feed( follower.targetFeed ).get( { internal: true } )
                    ] ) :
                    Promise.resolve( [ follower.originFeed, follower.targetFeed ] ) )
                    .then( ( [ originFeed, targetFeed ] ) => {

                      async.everySeries(
                        filterFollows,
                        ( item, cb ) => item.filter(
                          activity,
                          item.getFeeds ? originFeed : follower.originFeed,
                          item.getFeeds ? targetFeed : follower.targetFeed,
                          follower,
                          cb
                        ),
                        ( err, acceptedFilter ) => {

                          if ( err || !acceptedFilter ) {
                            followers = followers.filter( v => v.targetFeed !== follower.targetFeed );
                            return ecb( err );
                          }

                          knex( config.schemas.feed_activity ).insert( {
                            feed_id: follower.targetFeed,
                            activity_id: activity.id
                          } )
                            .asCallback( err => {

                              if ( err ) return ecb( err );

                              feedContainsActivity.push( follower );

                              service.feed( follower.targetFeed ).notifications.addActivity( activity, () => ecb() );

                            } );

                        }
                      );

                    } );

                }, err => {

                  if ( err ) return wcb( err );

                  async.concatSeries( followers, ( item, ccb ) => {

                    service.feed( item.targetFeed ).get( {
                      internal: true,
                      followedBy: true
                    } )
                      .then( feed => ccb( null, feed.followedBy ) )
                      .catch( ccb );

                  }, ( err, results ) => {

                    if ( err ) return wcb( err );

                    followers = results;

                    wcb();

                  } );

                } );

              } )
              .then( () => activity );

          } );

      } );

  }, { defaultHook } );

  return promisePlusCb( promise, cb );

};
