"use strict";

const svc = require( './service' ),

config = require( '../testconfig' ),

should = require( 'should' ),

mysql = require( 'mysql' );

describe( 'events - functional (server): legacy bridge', function() {

  this.timeout( 30000 );

  beforeEach( done => {

    svc.initAndLoad( config, [], { reset: true }, done );
      config.schemas.event + '_empty', // load empty event data set
      config.legacy.schemas.event,
      config.legacy.schemas.occurrence,
      config.legacy.schemas.eventTranslation,
      config.legacy.schemas.location,
      config.legacy.schemas.eventLocation,
      config.legacy.schemas.eventLocationTranslation,
      config.legacy.schemas.agendaEvent,
      config.legacy.schemas.user,
      config.legacy.schemas.agenda
    ], { reset: true }, done );

  } );

  afterEach( done => {

    svc.getConfig().knex.destroy( done );

  } );

  it( '1', done => done() );
  it( '2', done => done() );
  it( '3', done => done() );
  it( '4', done => done() );
  it( '5', done => done() );
  it( '6', done => done() );
  it( '7', done => done() );
  it( '8', done => done() );
  it( '9', done => done() );
  it( '10', done => done() );
  it( '11', done => done() );
  it( '12', done => done() );
  it( '13', done => done() );
  it( '14', done => done() );
  it( '15', done => done() );
  it( '16', done => done() );
  it( '17', done => done() );
  it( '18', done => done() );
  it( '19', done => done() );
  it( '20', done => done() );
  it( '21', done => done() );
  it( '22', done => done() );
  it( '23', done => done() );
  it( '24', done => done() );
  it( '25', done => done() );
  it( '26', done => done() );
  it( '27', done => done() );
  it( '28', done => done() );
  it( '29', done => done() );
  it( '30', done => done() );
  it( '31', done => done() );
  it( '32', done => done() );
  it( '33', done => done() );
  it( '34', done => done() );
  it( '35', done => done() );
  it( '36', done => done() );
  it( '37', done => done() );
  it( '38', done => done() );
  it( '39', done => done() );

} );