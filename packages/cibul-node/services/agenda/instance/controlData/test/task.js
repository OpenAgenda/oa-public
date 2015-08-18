"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'controlData' );

var controlData = require( '../' ),

es = require( '../../../../es/es' ),

model = require( '../../../../model' ),

should = require( 'should' ),

store = require( '../lib/store' ),

config = require( '../../../../../config' );

store.init( {
  redis: config.redis,
  namespace: 'testControlData'
} );


describe( 'controlData task', function() {

  var a = {}, events = [];

  beforeEach( model.fixtureSets.prepareOneAgendaInstance( a, 'la-gargouille' ) );

  beforeEach( function( done ) {

    a.events.list( {}, function( err, e ) {

      events = e;

      done();

    });

  });

  beforeEach( es.rebuild );

  it( 'should generate and store control data containing the events of the agenda', function( done ) {

    controlData.task.test.process( { id: a.id }, function() {

      // data should be stored now
      store.get( a.uid, function( err, ctlData ) {

        should( err ).equal( null );

        ctlData.ev.length.should.equal( events.length )

        done();

      });

    });

  });

});