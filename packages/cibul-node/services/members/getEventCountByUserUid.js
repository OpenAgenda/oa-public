"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );

module.exports = ( agendaUid, userUids ) => agendaEvents( agendaUid ).stats.countByUserUid( userUids )
