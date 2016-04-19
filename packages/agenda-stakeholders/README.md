#Overview

Service for handling agenda stakeholders.


#Methods

## Initialization

As stakeholders are always specific to one agenda, methods are only accessible through an object associated to an agenda id:

    const service = require( 'agenda-service' );

    // you need to init the service once in your project before using it with the config as defined in the 'Running the app' section
    service.init( yourconfig );

    var stakeholders = service( agendaId );

    // you are now handling stakholders of the agenda of Id 'agendaId'
    // stakeholders.list or .get ...


## Listing stakeholders

    stakeholders.list( options );

Options can contain:

 * offset & limit: you know, for pagination
 * query: nothing yet


## Getting a stakeholder

    stakeholders.get( identifiers, options );

Identifiers:

 * userId: the id of the user represented by the stakeholder

Options:

 * instanciate: true if the return stakeholder must be an instanciation ( defaults at false ). See below for details.


## Transfering an event from a stakeholder to another

An event can be transfered between stakeholders of a same agenda with this method

    stakeholders.transferEvent( options )

Options:

 * user: the user identifiers to which give the event; Example: { id: 9999 }
 * event: the identifiers of the event to transfer: { id: 28374 }


## Handling a stakeholder: instanciation

 To handle a stakeholder, it needs to be instanciated. Methods are then associated to the stakeholder that enable data to be fetched and/or modified
 
 Instanciation is done by either done by giving a stakeholder object fetched through a list or get to the 'instanciate method', or just by passing the 'instanciate' option to true during a get.

     let instance = stakeholders.instanciate( gottenStakeholder );

### Instanciated stakeholder: isValid

Find out whether stakeholder data is valid or not

    instance.isValid( ( err, is, errors ) => {

      if ( is ) console.log( 'is valid' );

    } );


### Instanciated stakeholder: setFieldValues

Set data as submitted for validation and save. setFieldValues will return an array of errors if the data is not valid.

    instance.setFieldValues( {
      contact_name: 'Freddy Krueger',
      organization: 'Cheesy Horror'
    }, { force: false }, ( err, result ) => {

      // result gives success, valid and errors:
      {
        success: true,
        valid: true,
        errors: []
      }

    } );

Options:

 * force: if not specified, is false; Ignores validation and saves to db anyways if set to true.


### Instanciated stakeholder: getFieldValues

Get data associated to stakeholder ready for use for display or edit in a form

    instance.getFieldValues( ( err, fieldValues, result ) => {

      // fieldValues are the subject of this method
      // result is validation info: { valid: true, errors: [] }

    } );


## Settings

Documentation pending. Get and set stakeholder config for an agenda ( field requirements mostly )


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