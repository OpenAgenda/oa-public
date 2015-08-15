"use strict";

process.env.NODE_ENV = 'test';

var instanciate = require( '../' ),

should = require( 'should' ),

model = require( '../../../model' ),

eventSvc = require( '../../../event' ),

config = require( '../../../../config' ),

q = require( 'queue' )( config.queues.groupActions, { 
  redis: config.redis
} );

describe( 'agenda instance groupActions', function() {

  var a = {};

  beforeEach( model.fixtureSets.prepareOneAgendaInstance( a, 'la-gargouille' ) );

  beforeEach( function( done ) {

    q.test.clear( done );

  });

  it( 'job should be queued', function( done ) {

    var agenda = instanciate( a );

    agenda.changeEventStates( eventSvc.STATETYPES.VALIDATED, function( err ) {

      setTimeout( function() {

        q.test.flush( function( err, queued ) {

          queued.length.should.equal( 1 );

          JSON.parse( queued[ 0 ] ).method.should.equal( 'dispatchChangeEventStates' );

          JSON.parse( queued[ 0 ] ).args.should.eql( [ agenda.id, eventSvc.STATETYPES.VALIDATED ] );

          done();

        });

      }, 100 );

    } );

  } );

});