#Overview

Service for handling agenda stakeholders.


#Methods

As stakeholders are always specific to one agenda, methods are only accessible through an object associated to an agenda id:

    var service = require( 'agenda-service' ),

    stakeholders = service( agendaId );

    stakeholders.method(); // this is a method executing whichever on stakeholders of agenda of id agendaId

  * transferEvent: transfer an event from a stakeholder to another.


#Running the app

create a testconfig.js file at the root of the project with the following configuration ( adapted to your db settings )

    "use strict";

    module.exports = {
      mysql : {
        host : '127.0.0.1',
        database : 'stakeholder_test',
        password : 'grut',
        user : 'root'
      },
      schemas : {
        agenda: 'agenda',
        event: 'event',
        stakeholder: 'stakeholder',
        stakeholderSettings: 'agenda_stakeholder_settings',
        agendaEvent: 'agenda_event'
      }
    }