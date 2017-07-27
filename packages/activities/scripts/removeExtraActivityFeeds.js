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

  let deleted = 0;
  const itemsToRemove = [];

  return _traverseTable(
    schemas.feed_activity,
    q => q.join( schemas.activity, `${schemas.feed_activity}.activity_id`, `${schemas.activity}.id` )
      .whereIn( `${schemas.activity}.verb`, [ 'agenda.changeEventState', 'agenda.removeEvent' ] ),
    offset => offset - deleted,
    async ( item, index, next ) => {

      console.log( '=============', index );

      const originFeed = await knex( schemas.feed ).select().first()
        .where( 'entity_type', 'agenda' )
        .where( 'entity_uid', item.target.split( ':' )[ 1 ] );

      if ( !originFeed || item.feed_id === originFeed.id ) {
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

        itemsToRemove.push( { feed_id: item.feed_id, activity_id: item.activity_id } );

      }

      /* if ( index === 100000 ) {

        return next( 'Stop to 100000 entries' );

      } */

      next();

    }
  )
    .then( async result => {

      const groupedItems = _.groupBy( itemsToRemove, 'activity_id' );

      for ( const activity_id in groupedItems ) {

        await knex( schemas.feed_activity ).del()
          .where( 'activity_id', activity_id )
          .whereIn( 'feed_id', groupedItems[ activity_id ].map( v => v.feed_id ) );

      }

      console.log( itemsToRemove.length, 'shits deleted !' );

      return result;

    } )
    .catch( async err => {

      const groupedItems = _.groupBy( itemsToRemove, 'activity_id' );

      for ( const activity_id in groupedItems ) {

        await knex( schemas.feed_activity ).del()
          .where( 'activity_id', activity_id )
          .whereIn( 'feed_id', groupedItems[ activity_id ].map( v => v.feed_id ) );

      }

      console.log( itemsToRemove.length, 'shits deleted !' );

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
        const query = knex( table ).offset( offset ).limit( 100 );

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
