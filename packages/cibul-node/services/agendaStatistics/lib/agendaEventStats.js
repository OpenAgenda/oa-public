"use strict";

const agendaEvents = require( 'agenda-events' );

module.exports = async agendaUid => {

  return {
    total: ( await agendaEvents( agendaUid ).list( 0, 0 ) ).total,
    published: ( await agendaEvents( agendaUid ).list( { state: 'published' }, 0, 0 ) ).total,
    ready: ( await agendaEvents( agendaUid ).list( { state: 'controlled' }, 0, 0 ) ).total,
    toBeCompleted: ( await agendaEvents( agendaUid ).list( { state: 'tocontrol' }, 0, 0 ) ).total
  }

}