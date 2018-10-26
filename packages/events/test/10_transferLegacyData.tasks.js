"use strict";

process.env.NODE_ENV='test';

const svc = require( './service' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'events - functional (server): transfer legacy data', function() {

  this.timeout( 120000 );

  beforeEach( done => {

    svc.initAndLoad( config, [
      config.schemas.event + '_few',
      config.legacy.schemas.event + '_few',
      config.legacy.schemas.occurrence,
      config.legacy.schemas.eventTranslation,
      config.legacy.schemas.location,
      config.legacy.schemas.eventLocation,
      config.legacy.schemas.eventLocationTranslation,
      config.legacy.schemas.agendaEvent,
      config.legacy.schemas.eventReferences,
      config.legacy.schemas.user,
      config.legacy.schemas.agenda,
      config.legacy.schemas.deleted
    ], { reset: true }, done );

  } );

  afterEach( svc.shutdown );

  /*it( 'transfer gives detailed report', done => {

    svc.tasks.transferLegacyData( ( err, result ) => {

      result.should.eql( {
        successes: 31,
        transfered: 26,
        removed: 3,
        fails: 0,
        removeFails: 0,
        failIds: [],
        removeFailIds: []
      } );

      done();

    } );

  } ); */



} );
