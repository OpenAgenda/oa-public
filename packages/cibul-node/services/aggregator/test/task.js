"use strict";

process.env.NODE_ENV = 'test';

var aggregator = require( '../' ),

should = require( 'should' );

describe( 'aggregator task', function() {

  beforeEach( function( done ) {

    aggregator.test.clear( done );

  });

  afterEach( aggregator.task.test.unsetOnProcessed );

  it( 'task calls right method on queue read', function( done ) {

    aggregator.task.test.setOnProcessed( function( err, data ) {

      err.should.equal( 'agenda not found' );

      data.lib.should.equal( 'notify' );

      data.method.should.equal( 'publish' );

      done();

    });

    aggregator.task();

    aggregator.notifyPublish( 'eventId', 'sourceId' );

  });

} );