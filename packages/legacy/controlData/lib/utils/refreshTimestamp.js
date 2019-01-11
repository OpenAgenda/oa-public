"use strict";

module.exports = ( prefix, asyncRedis, agendaUid ) => {

  return asyncRedis.set(
    prefix + agendaUid + ':timestamp',
    JSON.parse( JSON.stringify( new Date ) )
  );

}
