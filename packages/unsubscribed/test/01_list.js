"use strict";

const should = require( 'should' ),

  service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  _ = require( 'lodash' );

describe( 'unsubscribed - functional: .list', function () {

  this.timeout( 5000 );

  beforeEach( done => {

    service.initAndLoad( config, done );

  } );

  it( 'simple .list', done => {

    const userUid = 75052324;

    service( userUid ).list( ( err, result ) => {

      should( err ).equal( null );

      result.unsubscriptions.should.eql( [ {
        id: 8,
        userUid: 75052324,
        type: 'agenda_event_update',
        subject: 'agenda',
        identifier: 85870128,
        createdAt: new Date( '2017-03-03T14:04:17.000Z' )
      }, {
        id: 7,
        userUid: 75052324,
        type: 'agenda_event_submit_moderation',
        subject: 'agenda',
        identifier: 85870128,
        createdAt: new Date( '2017-03-03T12:22:44.000Z' )
      }, {
        id: 4,
        userUid: 75052324,
        type: 'notifications_summary',
        subject: 'notifications',
        createdAt: new Date( '2017-03-03T08:24:05.000Z' )
      }, {
        id: 3,
        userUid: 75052324,
        type: 'agenda_event_submit_moderation',
        subject: 'agenda',
        identifier: 97998826,
        createdAt: new Date( '2017-03-03T08:24:05.000Z' )
      }, {
        id: 2,
        userUid: 75052324,
        type: 'agenda_event_update',
        subject: 'agenda',
        identifier: 97998826,
        createdAt: new Date( '2017-03-03T07:47:25.000Z' )
      } ] );

      done();

    } );

  } );

  it( '.list with a query', done => {

    const userUid = 75052324;

    service( userUid ).list( { type: 'agenda_event_submit_moderation' }, ( err, result ) => {

      should( err ).equal( null );

      result.unsubscriptions.should.eql( [ {
        id: 7,
        userUid: 75052324,
        type: 'agenda_event_submit_moderation',
        subject: 'agenda',
        identifier: 85870128,
        createdAt: new Date( '2017-03-03T12:22:44.000Z' )
      }, {
        id: 3,
        userUid: 75052324,
        type: 'agenda_event_submit_moderation',
        subject: 'agenda',
        identifier: 97998826,
        createdAt: new Date( '2017-03-03T08:24:05.000Z' )
      } ] );

      done();

    } );

  } );

} );
