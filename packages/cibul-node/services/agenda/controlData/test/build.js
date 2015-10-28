"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

build = require( '../lib/build' ),

es = require( '../../../elasticsearch' ),

model = require( '../../../model' ),

store = require( '../lib/store' ),

config = require( '../../../../config' );

store.init( {
  redis: config.redis,
  namespace: 'testControlData'
} );

describe( 'controlData build', function() {

  var a = {}, events = [];

  beforeEach( model.fixtureSets.prepareOneAgendaInstance( a, 'la-gargouille' ) );

  beforeEach( function( done ) {

    a.events.list( {}, function( err, e ) {

      events = e;

      done();

    });

  });

  beforeEach( es.resync );

  it( 'should generate and store control data containing the events of the agenda', function( done ) {

    build( { id: a.id }, function() {

      // data should be stored now
      store.get( a.uid, function( err, ctlData ) {

        should( err ).equal( null );

        ctlData.ev.length.should.equal( events.length )

        done();

      });

    });

  });

});