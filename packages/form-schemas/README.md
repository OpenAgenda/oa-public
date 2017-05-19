# Overview

This service provides features for building, modifying, validating and storing Custom Form Schemas.

The base object it handles is a form-schema object, which bundles list of field definitions associating each of them with the required info for displaying them as a form item and instanciating the matching validator ( from validators lib ).

Base functionality include:

 * an iso form field validator telling you if the input field definition is valid
 * an iso form schema instance with useful getters and setters to handle an form-shcema object
 * service crud operations to create, update, get and remove form schemas
 * a service to transfer legacy OA custom fields, tag set and category set to a valid form schema structure

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


# Todo

agenda-events service will store custom data validated by a form schema belonging to the agenda. This data needs to be transfered from legacy data structure. given a form-schema, an event id and an agenda id, it will retrieve raw legacy custom field data ( fetched in review_article, review_article_tag and event - custom data is stored directly in event ), a bridging library can collect data and offer a validated data set matching the event reference in an agenda to be used by an eventual agenda-events service rebuild or transfer feature.