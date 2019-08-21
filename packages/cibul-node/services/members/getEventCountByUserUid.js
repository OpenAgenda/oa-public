"use strict";

const _ = require( 'lodash' );

const agendaEvents = require( '@openagenda/agenda-events' );

const log = require( '@openagenda/logs' )( 'services/members/getEventCountByUserUid' );

module.exports = ( agendaUid, userUids = [] ) => {

  if ( !agendaUid ) return [];

  log( 'processing %d %j', agendaUid, _.uniq( userUids ) );

  return agendaEvents( agendaUid ).stats.countByUserUid( _.uniq( userUids ) );
}
