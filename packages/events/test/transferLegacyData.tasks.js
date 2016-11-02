"use strict";

const svc = require( '../service/test' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'transferLegacyData', function() {

  this.timeout( 120000 );

  before( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    svc.test.fixtures( [
      config.schemas.event + '_empty',
      config.legacy.schemas.event,
      config.legacy.schemas.occurrence,
      config.legacy.schemas.eventTranslation,
      config.legacy.schemas.location,
      config.legacy.schemas.eventLocation,
      config.legacy.schemas.eventLocationTranslation,
      config.legacy.schemas.agendaEvent,
      config.legacy.schemas.user,
      config.legacy.schemas.agenda
    ], done );

  } );

  it( 'transfer has 0 fails', done => {

    svc.tasks.transferLegacyData( { offset: 0, total: 20 }, ( err, result ) => {

      result.fails.should.equal( 0 );

      done();

    } );

  } );

} );