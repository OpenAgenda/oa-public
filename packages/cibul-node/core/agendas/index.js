"use strict";

module.exports = agendaUid => {

  return {
    events: require( './events' )( agendaUid )
  }
  
}