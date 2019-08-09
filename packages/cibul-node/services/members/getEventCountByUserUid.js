"use strict";

const _ = require( 'lodash' );

const agendaEvents = require( '@openagenda/agenda-events' );

const log = require( '@openagenda/logs' )( 'services/members/getEventCountByUserUid' );

module.exports = ( agendaUid, userUids = [] ) => {

  if ( !agendaUid ) return [];

  log( 'processing', agendaUid, _.uniq( [].concat( userUids ).join( ',' ) ) );

  return agendaEvents( agendaUid ).stats.countByUserUid( _.uniq( userUids ) );
}
