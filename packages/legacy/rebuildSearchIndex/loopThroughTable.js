"use strict";

const _ = require( 'lodash' );

module.exports = async ( knex, table, asyncFn, startFromId = 99999999 ) => {

  let lastId = startFromId, ids;

  while ( ( ids = await knex( table )
    .select( 'id' )
    .where( 'id', '<', lastId )
    .limit( 100 )
    .orderBy( 'id', 'desc' )
    .then( r => r.map( r => r.id ) )
  ).length ) {

    lastId = _.last( ids );

    for ( const id of ids ) {
      await asyncFn( id );
    }

  }

}
