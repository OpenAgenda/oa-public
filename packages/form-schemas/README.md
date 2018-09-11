# Overview

This service provides features for building, modifying, validating and storing Custom Form Schemas.

The base object it handles is a form-schema object, which bundles list of field definitions associating each of them with the required info for displaying them as a form item and instanciating the matching validator ( from validators lib ).

Base functionality include:

 * an iso form field validator telling you if the input field definition is valid
 * an iso form schema instance with useful getters and setters to handle an form-shcema object
 * service crud operations to create, update, get and remove form schemas
 * a service to transfer legacy OA custom fields, tag set and category set to a valid form schema structure

# Endpoints

 * .create
 * **.get**: get by form schema id. promise.

# Validation

 * Validate this...

# Instance

## Methods

This is a quick summary. For details, check tests: `test/FormSchema.js`

 * **isNew()**: true if a FormSchema is new
 * **isEmpty()**: true if a FormSchema is empty
 * **addField( fieldData )**: adds a field to the schema
 * **getFieldCount()**: gives the number of fields
 * **getField( index )**: gets a field by its position index in schema
 * **moveField( index, moves )**: moves field up or down in the schema by given number of moves. Minus goes up, plus goes down
 * **removeField( index )**: remove field from schema 


# Service

Provides create, update, get and remove methods. See tests for details.

# Legacy bridge

On the legacy platform, custom field schemas are stored in the agenda data model. A legacy bridge function can parse those to form a FormSchema that can be validated. Otherwise it just throws an error.


# Front app development

Just `yarn start` to start working on an app. Dev apps can be split in multiple files, they must all be placed in `/client/src/dev`. To add a new dev application, just add a file of the same name in the folder and reference it in the dev index file.

This structure makes it practical to target development on specific sub parts without having to load all front scripts.


# About file keys

When an instance is created from a form schema that allows users to load static assets such as files and images, a unique file key is generated for that instance to be used for naming these assets with name unique names that link them to the instance.

To illustrate, a form schema requires a user to load an image and a pdf file.

The file key is generated at the creation of the object, once data is validated.
