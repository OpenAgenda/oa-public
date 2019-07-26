"use strict";

const _ = require( 'lodash' );

module.exports = async function( knex, agendaId, promiseFn ) {

  let lastId = 0;
  let refs = [];

  while ( ( refs = await knex( 'review_article as ra' )
    .select( [
      'ra.id as ra_id',
      'uid'
    ] ).leftJoin( 'event as e', 'ra.event_id', 'e.id' )
    .where( 'review_id', agendaId )
    .andWhere( 'ra.id', '>', lastId )
    .limit( 20 )
  ).length ) {

    for ( const ref of refs ) await promiseFn( ref );

    lastId = _.last( refs ).ra_id;

  }

}
