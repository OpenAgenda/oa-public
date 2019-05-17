"use strict";

const _ = require( 'lodash' );

let config, knex;

module.exports = {
  init: ( c, k ) => { config = c; knex = k },
  countByUserUid
}

function countByUserUid( agendaUid ) {

  return knex( config.schemas.agendaEvent )
    .select(
      knex.raw( 'count(id) as event_count, user_uid' )
    )
    .where( 'agenda_uid', agendaUid )
    .groupBy( 'user_uid' )
    .then( r => r.map( r => ( {
      count: r.event_count,
      userUid: r.user_uid
    } ) ) );

}

