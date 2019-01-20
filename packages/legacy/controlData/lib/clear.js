"use strict";

module.exports = ( { prefix, redis }, agendaUid ) => {

  return redis.del( prefix + agendaUid );

}
