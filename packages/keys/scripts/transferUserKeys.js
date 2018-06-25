"use strict";

const knexClient = require( 'knex' );
const async = require( 'async' );

const config = {
  mysql: {
    host: '127.0.0.1',
    database: 'oadev',
    password: 'grut',
    user: 'root'

  },
  schemas: {
    key: 'key',
    apiKeySet: 'api_key_set',
    user: 'user'
  }
};

const knex = knexClient( {
  client: 'mysql',
  connection: config.mysql
} );

const keysToCreate = [];

_traverseTable(
  config.schemas.apiKeySet,
  q => q
    .select( [ `${config.schemas.user}.*`, `${config.schemas.apiKeySet}.*` ] )
    .join( config.schemas.user, `${config.schemas.apiKeySet}.user_id`, `${config.schemas.user}.id` )
    .where( `${config.schemas.apiKeySet}.type`, 1 ),
  async ( item, index, next ) => {

    console.log( `Key set n°${index}` );

    try {

      if ( item.api_key ) {
        keysToCreate.push( { type: 'userPublic', identifier: item.uid, key: item.api_key } );
      }

      if ( item.api_secret ) {
        keysToCreate.push( { type: 'userPrivate', identifier: item.uid, key: item.api_secret } );
      }

      next();

    } catch ( e ) {

      next( e );

    }

  }
)
  .then( () => {

    console.time( 'Insert' );

    return knex.transaction( async t => {

      try {

        for ( const item of keysToCreate ) {

          await knex( config.schemas.key )
            .transacting( t )
            .insert( item );

        }

      } catch ( e ) {

        console.error( e );

        return await t.rollback();

      }

      await t.commit();

      console.timeEnd( 'Insert' );

    } );

  } )
  .then( () => {
    knex.destroy();
  } )
  .catch( err => {
    console.error( 'Error:', err );
    knex.destroy();
  } );

// eachCb is called with arguments (item, index, next)
function _traverseTable( table, queryModifier, eachCb ) {

  let rowsCount = 0;
  let rowsAffected = 0;

  return new Promise( ( resolve, reject ) => {

    async.doWhilst(
      dcb => {

        const query = knex( table ).offset( rowsAffected ).limit( 100 );

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
