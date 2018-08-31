# Overview

Stores custom data and associated reference identifier and form_schema references. Form schema dictates the structure of the custom data.

# Initialization

    const service = require( 'custom' );

    service.init( {
      mysql, // your mysql connection settings
      schemas: {
        custom: 'custom' // name of the destination table
      },
      interfaces: {
        getValidator: async formSchemaId => {} // interface to get the validator matching the form schema id
      }
    } );



# CRUD Operations

CRUD operations are accessible through a generic endpoint taking the id of the reference form schema:

    let formSchemaId = 12; // why not.

  * `custom( formSchemaId ).create( identifier, customData )`
  * `custom( formSchemaId ).update( identifier, customData )`
  * `custom( formSchemaId ).get( identifier )`
  * `custom( formSchemaId ).list( offset, limit )`
  * `custom( formSchemaId ).remove( identifier )`

.
