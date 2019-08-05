# Overview

Do stuff with agendas: list, get, set them.

# Initialisation

    const agendas = require( 'agendas' );

    agendas.init( {
      // change this to your db parameters
      config: require( './testconfig.sample.js' )
    } );

# List

List agendas

... with callback:

    agendas.list( [ query ], offset, limit, options, ( err, agendas, count ) => {

    } );

... or a promise:

    const { agendas } = await agendas.list( [ query ], offset, limit, options );

## Query parameters

 * **uid**: one or multiple agenda uids
 * **search**: sql like search in title, description and slug
 * **order** : order by last update or creation date - possible values: 'updatedAt.desc', 'updatedAt.asc', 'createdAt.desc', 'createdAt.asc' ( default ).

## Options

 * **total**: include total in result ( requires an extra query )
 * **detailed**: include stats about agendas ( query more costly )
 * **private**: if true, gets private agendas only, false ( default ) get public agendas, null gets both.

If count was requested, it is given in third param


# Get

Get an agenda

    agendas.get( identifier(s), [ options ], cb );

If identifiers is an integer, it is used as if it were the id of the requested agenda. Else, it is an object with the following possible identifiers ( combined or not ): id, uid or slug

## Options

 * **detailed**: get detailed information on the agenda ( stats )
 * **internal**: include strictly internal info, such as id, ownerid, credentials
 * **instanciate**: gives agenda instance instead of data if true. Defaults at false

## Callback

    cb( err, agenda )


# Set

Update or create an agenda

## Create

    agendas.set( data, [ options ], cb );

### Data

The data used for the creation. Check test/service.set.create.js for an example, and the agendaSchema in service/validate.js for possible agenda values.

### Options

 * **internal**: defaults at false - if true allows to set values defined as 'internal' in the service/validate.js map


## Update

    agendas.set( identifiers, data, [ options ], cb );

identifiers can be the id of the agenda or an object containing any or several of the following identifiers: id, uid, slug

### Data

The data to be updated; Check test/service.set.update.js for an example, and the agendaSchema in service/validate.js for possible values

### Options

 * **protected**: defaults at false - if true, allows update of values defined as protected in the service/validate map ( ex: uid, id, ownerId, credentials )

 * **internal**: defaults at false - if true, returned updated agenda includes internal data ( see validate map )


## Slugs

Agenda slug-related features. Mainly, check wether a slug is available or not, or generate a slug from a string of characters.

### isTaken

Server side-only fonction to check wether slug is already taken or not. First verifies if given slug is valid

    agendas.slugs.isTaken( 'this-is-a-slug', ( err, result ) => {

      // result looks like this: { taken: true/false, valid: true/false, errors: [] }

    } );

Optionnally, specify a uid that should be omitted from check ( typically, the current agenda slug )

    agenda.slugs.isTaken( 'this-is-a-slug', { excludeUid: 123 }, ( err, result ) => {

      // ...

    } );

Errors are only given if given slug is not valid

### Generate

Can be used on client. Makes a slug out of a string

    let genSlug = require( './service/slugs/generate' );

    genSlug( 'This is a string' ); // returns this-is-a-string



# Instanciate

Agenda instances are useful to do operations on specific agendas. They are objects with getters and setters.

They can be loaded through a get ( this is the prefered way ):

    service.get( aId, { instanciate: true }, ( err, agendaInstance ) => { ... } );

Or by giving agenda data to the .instanciate interface

    let agendaInstance = service.instanciate( agendaData );

## Methods

See tests for examples

 * getImage( absolutePath = false ): get the image value. If no image, returns null.
 * setImage( options, cb ): set the image. options are url or path. Gives a result in callback with the list of image paths on aws s3.
 * clearImage( cb ): clears the image.


# Random dev notes


## Migration

 * official table entry needs to be added
 * credentials need to go from review_credentials to credentials

## Settings

This service usage is not documentation. More like todos.

    .settings

      .theme

      .credentials
        .moderators
        .tags
        .chatbox
        .embeds
          .head
          .templates

      .exports
        .pdf

      .keys: [ { type, rights } ] // list of hashes found in store

      .stakeholders: [ { type, rights, fields } ]
        // may be in own service
        // types: 'all', 'administrator', 'moderator', 'contributor'

      .contribution
        .message
        .type

      .events

        .decorators // in fields?
          .longDescription
            .suffix

        .fields
          .standard: []
          .custom: []


#Sample config

See testconfig.sample.js
