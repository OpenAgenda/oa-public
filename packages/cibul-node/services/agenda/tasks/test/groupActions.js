"use strict";

process.env.NODE_ENV = 'test';

var groupActionsTask = require( '../groupActions.js' ),

should = require( 'should' ),

model = require( '../../../model' ),

eventSvc = require( '../../../event' ),

config = require( '../../../../config' ),

q = require( 'queue' )( config.queues.groupActions, { 
  redis: config.redis
} ),

elastic = require( '../../../elasticsearch' );

describe( 'agenda groupActions task', function() {

  var a = {}, events = [];

  beforeEach( model.fixtureSets.prepareOneAgendaInstance( a, 'la-gargouille' ) );

  beforeEach( q.test.clear );

  beforeEach( elastic.resync );

  beforeEach( function( done ) {

    a.events.list( {}, function( err, result ) {

      events = result;

      done();

    });

  });

  it( 'changeEventState', function( done ) {

    model.lib.query( 'select state from review_article where review_id = ? and event_id = ?', [ a.id, events[ 0 ].id ], function( err, rows ) {

      var previousState = rows[ 0 ].state;

      groupActionsTask.changeEventState( a.id, events[ 0 ].id, eventSvc.STATETYPES.VALIDATED, function( err ) {

        model.lib.query( 'select state from review_article where review_id = ? and event_id = ?', [ a.id, events[ 0 ].id ], function( err, rows ) {

          var newState = rows[ 0 ].state;

          newState.should.not.equal( previousState );

          newState.should.equal( eventSvc.STATETYPES.VALIDATED );

          done();
        
        });

      } );

    });

  });

  it( 'dispatchChangeEventStates', function( done ) {

    groupActionsTask.dispatchChangeEventStates( a.id, eventSvc.STATETYPES.VALIDATED, function( err ) {

      setTimeout( function() {

        q.test.flush( function( err, flushed ) {

          flushed.length.should.equal( 3 );

          flushed.forEach( function( f, i ) {

            f = JSON.parse( f );

            f.method.should.equal( 'changeEventState' );

            f.args[ 0 ].should.equal( a.id );

            f.args[ 2 ].should.equal( eventSvc.STATETYPES.VALIDATED );

            events.map( function( e ) { return e.id; } ).indexOf( f.args[ 1 ] ).should.not.equal( -1 );

          });

          done();

        });

      }, 100 );

    } );

  } );

});