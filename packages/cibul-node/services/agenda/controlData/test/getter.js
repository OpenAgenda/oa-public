"use strict";

process.env.NODE_ENV = 'test';

var controlData = require( '../' ),

should = require( 'should' ),

es = require( '../../../es/es' ),

model = require( '../../../model' ),

redis = require( 'redis' ),

config = require( '../../../../config' ),

agendaSvc = require( '../../' ),

getter = require( '../lib/getter' ),

store = require( '../lib/store' );

store.init( {
  redis: config.redis,
  namespace: 'testCtlData'
} );

describe( 'controlData getter', function() {

  var dbA = {}, svcA, events = [];

  beforeEach( model.fixtureSets.prepareOneAgendaInstance( dbA, 'la-gargouille' ) );

  beforeEach( function() {

    svcA = agendaSvc.instanciate( dbA );

  });

  beforeEach( function( done ) {

    dbA.events.list( {}, function( err, e ) {

      events = e;

      done();

    });

  });

  beforeEach( store.test.clear );

  beforeEach( es.rebuild );

  it( 'generates on the fly if nothing is stored', function( done ) {

    getter( svcA, dbA )( function( err, ctlData ) {

      ctlData.ev.length.should.equal( events.length );

      done();

    });

  });

  it( 'returns whatever is stored if anything is found', function( done ) {

    store.set( svcA.uid, { wigglipoof: true }, function( err ) {

      getter( svcA, dbA )( function( err, ctlData ) {

        ctlData.should.eql( { wigglipoof: true } );

        done();

      });

    });

  });

} );