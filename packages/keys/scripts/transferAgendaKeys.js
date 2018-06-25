"use strict";

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
    agenda: 'review',
    key: 'key'
  }
};

const knex = knexClient( {
  client: 'mysql',
  connection: c.mysql
} );

transferAgendaKeys( c )
  .then( result => {
    console.log( 'Result:', result );
    knex.destroy();
  } )
  .catch( err => {
    console.error( 'Error:', err );
    knex.destroy();
  } );

function transferAgendaKeys( config ) {

  return _traverseTable( config.schemas.agenda, q => q.where( 'store', 'like', '%"keys":[%' ), ( item, index, next ) => {

    const store = JSON.parse( item.store );

    async.eachOfSeries( store.keys.map( v => v.hash ), ( key, i, ecb ) => {

      knex( config.schemas.key )
        .insert( { type: 'agendaFullRead', identifier: item.uid, key } )
        .asCallback( ecb );

    }, next );

  } );

}

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
