"use strict";

module.exports = ( { prefix, knex, redis }, agendaUid ) => {

  return redis.del( prefix + agendaUid );

}
