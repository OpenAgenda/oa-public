"use strict";

module.exports = {
  mysql: {
    host: '127.0.0.1',
    database: 'oa_event_refs',
    password: '**',
    user: 'root'
  },
  schema: 'agenda_event_reference',
  interfaces: {

    events: function() { cb( 'events interface is not specified' ) }
  }
}