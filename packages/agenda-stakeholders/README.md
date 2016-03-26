#Overview

Service for handling agenda stakeholders.

#Methods

As stakeholders are always specific to one agenda, methods are only accessible through an object associated to an agenda id:

    var service = require( 'agenda-service' ),

    stakeholders = service( agendaId );

    stakeholders.method(); // this is a method executing whichever on stakeholders of agenda of id agendaId

  * transferEvent: transfer an event from a stakeholder to another.
