"use strict";

const events = require( './events' );
const settings = require( './settings' );

module.exports = agendaUid => {

  return {
    events: events( agendaUid ),
    settings: settings( agendaUid )
  }

}
