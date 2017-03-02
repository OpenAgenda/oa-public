# Overview

Users are tired of receiving emails. They cannot unsubscribed. This service enables basic crud ops on an unsubscription list, maintanable by user, email type, object and object identifier.

# Endpoints

All operations are always done for a single user. Service will expose endpoints by user:

    service( userUid ).doStuff( ...

Endpoints are:

 * **.add**: add a new unsubscription reference
 * **.remove**: remove a reference
 * **.is**: test a reference
 * **.clear**: clear all referrences for a user

For each endpoint, one argument of identifiers is required with the following fields:

 * type: the type of the unsubscription
 * subject: the subject of the unsubscription ( agenda, event... )
 * identifier: the identifier of the subject

type or subject are required.

## Examples

    unsubscribed( userUid ).add( {
      type: 'notification.eventCreated', 
      subject: 'agenda', 
      identifier: 1234
    }, cb );

    unsubscribed( userUid ).is( {
      type: 'notification.eventCreated',
      subject: 'agenda',
      identifier: 1234
    }, cb );

    unsubscribed( userUid ).remove( {
      type: 'notification.eventCreated',
      subject: 'agenda',
      identifier: 1234
    }, cb );

    unsubscribed( userUid ).clear( cb ) // remove all the unsubscriptions of the user

# Express application

This service is accessible from a parent express instance via its own express application. Use `app.use` on parent app as shown in tests.

## genUrl

Use genUrl to build links based on values. See tests in app test file.


# Tests

This is tested. Check tests for use cases.