"use strict";

const _ = require( 'lodash' );
const knexClient = require( 'knex' );
const async = require( 'async' );

const c = {
  mysql: {
    host: '127.0.0.1',
    database: 'oadev',
    password: 'grut',
    user: 'root'

  },
  schemas: {
    activity: 'activity',
    feed: 'activity_feed',
    feed_activity: 'activity_feed_activity',
    feed_follow: 'activity_feed_follow'
  }
};

const knex = knexClient( {
  client: 'mysql',
  connection: c.mysql
} );

removeExtraActivityFeeds( c )
  .then( result => {
    console.log( 'Result:', result );
    knex.destroy();
  } )
  .catch( err => {
    console.error( 'Error:', err );
    knex.destroy();
  } );

function removeExtraActivityFeeds( { schemas } ) {

  let preOffset = 0;
  let deleted = 0;
  const itemsToRemove = {};

  return _traverseTable(
    schemas.feed_activity,
    q => q.join( schemas.activity, `${schemas.feed_activity}.activity_id`, `${schemas.activity}.id` )
      .join( schemas.feed, `${schemas.feed_activity}.feed_id`, `${schemas.feed}.id` )
      .whereIn( `${schemas.activity}.verb`, [ 'agenda.changeEventState', 'agenda.removeEvent' ] ),
    offset => offset - deleted + preOffset,
    async ( item, index, next ) => {

      console.log( '=============', index );

      // If it's another agenda
      if ( item.entity_type === 'agenda' ) {

        if ( item.entity_uid !== parseInt( item.target.split( ':' )[ 1 ] ) ) {

          if ( !itemsToRemove[ item.activity_id ] ) {

            itemsToRemove[ item.activity_id ] = [ item.feed_id ];

          } else {

            itemsToRemove[ item.activity_id ].push( item.feed_id );

          }

        }

        return next();

      }

      // If it's a contributor
      const originFeed = await knex( schemas.feed ).select().first()
        .where( 'entity_type', 'agenda' )
        .where( 'entity_uid', item.target.split( ':' )[ 1 ] );

      if ( !originFeed ) {
        return next();
      }

      const follow = await knex( schemas.feed_follow ).select().first()
        .where( 'target_feed', item.feed_id )
        .where( 'origin_feed', originFeed.id );

      if ( !follow ) {
        return next();
      }

      follow.store = JSON.parse( follow.store || '{}' );

      if ( follow.store.credential === 1 ) {

        if ( !itemsToRemove[ item.activity_id ] ) {

          itemsToRemove[ item.activity_id ] = [ item.feed_id ];

        } else {

          itemsToRemove[ item.activity_id ].push( item.feed_id );

        }

      }

      /* if ( index >= 100000 ) {

        return next( new Error( 'Stop to 100000 entries' ) );

      } */

      next();

    }
  )
    .then( async result => {

      for ( const activity_id in itemsToRemove ) {

        await knex( schemas.feed_activity ).del()
          .where( 'activity_id', activity_id )
          .whereIn( 'feed_id', itemsToRemove[ activity_id ] );

      }

      console.log( _.sumBy( _.values( itemsToRemove ), v => v.length ), 'shits deleted !' );

      return result;

    } )
    .catch( async err => {

      for ( const activity_id in itemsToRemove ) {

        await knex( schemas.feed_activity ).del()
          .where( 'activity_id', activity_id )
          .whereIn( 'feed_id', itemsToRemove[ activity_id ] );

      }

      console.log( _.sumBy( _.values( itemsToRemove ), v => v.length ), 'shits deleted !' );

      return Promise.reject( err );

    } );

}

// eachCb is called with arguments (item, index, next)
function _traverseTable( table, queryModifier, offsetModifier, eachCb ) {

  let rowsCount = 0;
  let rowsAffected = 0;

  return new Promise( ( resolve, reject ) => {

    async.doWhilst(
      dcb => {

        const offset = offsetModifier( rowsAffected );
        const query = knex( table ).offset( offset ).limit( 500 );

        queryModifier( query )
          .then( rows => {

            rowsCount = rows.length;
            rowsAffected += rows.length;

            if ( !rows.length ) return dcb();

            async.eachOfSeries( rows, ( item, i, ecb ) => {
              eachCb( item, rowsAffected - rows.length + Number.parseInt( i ), ecb );
            }, dcb );

          } );

      },
      () => rowsCount > 0,
      err => {

        if ( err ) return reject( err );

        resolve( rowsAffected );

      }
    );

  } );

}
