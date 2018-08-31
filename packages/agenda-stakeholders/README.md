#Overview

Service for handling agenda stakeholders.


# Testing

Whether you want to use this service for your own lib tests or you want to add tests here, use the proxy service module `require( '@openagenda/agenda-stakeholders/test/service' )`. It provides an additional method to load service config and prepare fixtures in one go:

    const stakeholders = require( 'agenda-stakeholders/test/service' );

    stakeholder.initAndLoad( config, [ [ files ] ], done );

The optional files array is a list of the filenames to use for loading fixtures. Files are stored in the test/service folder of this repo. Not specifying this will just leave the test service to load default fixtures.


# Methods

## Initialization

As stakeholders are always specific to one agenda, methods are only accessible through an object associated to an agenda id:

    const service = require( 'agenda-stakeholders' );

    // you need to init the service once in your project before using it with the config as defined in the 'Running the app' section
    service.init( yourconfig, err => { /* initialized and ready to use! */ } );

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


## Updating a stakeholder

    service.agenda( id ).update( identifiers, data, [ options ], cb )

Options:

 * deletedUser: if set to true, userId will be nulled and stakeholder will be flagged as being linked to an account that has been deleted


## Handling a stakeholder: Stakeholder

A stakeholder instance can be created on either client or server sides with iso/Stakeholder for updating stakholder field values and/or credential.

### Basic usage & instanciation

The simplest way to start using an instance is just to instanciate with a set of field values:

    const Stakeholder = require( '@openagenda/agenda-stakeholders/dist/iso/Stakeholder');

    let fieldValues = {
      contactName: 'Al Ain',
      contactPosition: 'Hydration manager',
      organization: 'Al Ain mineral',
      email: 'al@ain.ae',
      contactNumber: '+971509232812'
    };

    let s = new Stakeholder( fieldValues );

    s.get(); // gives the field values

Update field values using set:

    // starting from end of previous example
    let updatedValues = extend( {}, fieldValues, { email: 'updated@email.com' } );

    s.set( updatedValues ); // returns an array of validation errors ( or an empty array )

To send data to a ressource that will store updates, a link can be set on the instance after it was created

    s.setRes( 'http://localhost:3000/some/path' );

Alternatively, the instance can be linked to a resource at initialization

    let s = new Stakeholder( fieldValues, { res: 'http://localhost:3000/some/path' } );

    s.set( updatedValues );

    // data posted to res will look like this: { fieldValues: .. }
    s.commit( ( err, result ) => {

      /**
       * result looks like this
       * {
       *   success: true,
       *   valid: true,
       *   errors: [], // if valid is false, this is not empty
       *   fieldValues: // the values committed
       * }
       **/

    } );

### Handling a stakeholder credential

The credential of a stakeholder can updated through an instance.
For that to happen, separate data given at initialization between
field values and credential.

    let s = new Stakeholder( {
      fieldValues,
      credential: 2
    }, { res } );

From there, set should look like this:

    s.set( { fieldValues, credential } )

And a .commit will send `{ fieldValues, credential }`.



## Handling a stakeholder: instanciation ( deprecated )

 To handle a stakeholder, it needs to be instanciated. Methods are then associated to the stakeholder that enable data to be fetched and/or modified
 
 Instanciation is done by either done by giving a stakeholder object fetched through a list or get to the 'instanciate method', or just by passing the 'instanciate' option to true during a get.

     let instance = stakeholders.instanciate( gottenStakeholder );

Available methods ( check for details below ):

 * isValid
 * getFieldValues
 * setFieldValues
 * save

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


### Create a new stakeholder

the .new method will return a stakeholder ready to be handled and saved. It needs to be given its field values beforehand:

    let instance = service.new( { userId: 123 } );

    // if this goes well, save is implicit.
    instance.setFieldValues( { ... } )

    // if the instance is not to be saved at field
    // values save, it can be saved later with .save

    instance.setFieldValues( { ... }, { save: false }, err => {

      instance.save( ( err, result ) => { ... } );

    } );


## Settings

Documentation pending. Get and set stakeholder config for an agenda ( field requirements mostly )


## Validation

For validation, service relies on service/validator which exposes a field set validator configured on the basis of fields defined in the agenda stakeholder settings.

This validator is to be used on the frontend of the app as well

    var validator = require( './service/validator' );  

    service.settings.get( ( err, settings ) => {

      var v = validator( settings.fields );

      try {

        var clean = v( [ { field: 'organization', value: 'Acme Inc' }, { ... } ] );

      } catch ( errors ) {

        // errors are associated with fields as well, in a list, to allow component to redistribute them

      }

    } );


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
