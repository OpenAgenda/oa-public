"use strict";

process.env.NODE_ENV = 'test';

var adminSvc = require( '../admin' ),

config = require( '../../../config' ),

es = require( 'ES' )( config.es ),

model = require( 'cibulModel' )( config.db ),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( model ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

should = require( 'should' ),

lib = require( '../../../lib/lib' ),

testData = {};


/**
 * ================================ TESTS =====================================
 */

describe( 'admin service', function() {

  this.timeout( 20000 );

  before( function( done ) {

    async.series( [ _loadTestEvents, _indexTestEvents ], done );

  } );


  it( 'getEventsByWeek returns an array of events distributed over weeks', function( done ) {

    adminSvc.getIndexedEventsByWeek( { year: '2014' }, function( err, result ) {

      var expectedRanges = [ '13 oct.', '10 nov.', '08 déc.' ], i;

      result.length.should.equal( 3 );

      for( var i = 0; i < expectedRanges.length; i++ ) {

        result[ i ].l.should.equal( expectedRanges[ i ] );

      }

      done();

    });

  } );


  it( 'getIndexDiff gives the difference between primary db event/agenda ref count and search index', function( done ) {

    fixtures.load( 'events', 'veille-de-noel', { ownerId: testData.u.id, locations: [ { uid: testData.l.uid } ] }, function( err ) {

      adminSvc.getIndexDiff( function( err, count ) {

        // delta is the some of original events and references... or not! orphans are 

        // count of unreferenced events + sum of event references

        count.should.equal( 1 );

        done();

      });

    } );

  });


} );



/**
 * =========================== HELPER FUNCTIONS ===============================
 */


/**
 * index all events from db in elastic search
 */

function _indexTestEvents( cb ) {

  async.waterfall( [

    es.resetIndex,

    model.events().list,

    function( events, wcb ) {

      async.each( events, function( event, ecb ) {

        es.events().insert( event, ecb );

      }, wcb );

    }

  ], cb );

}


/**
 * clear and load 3 events in the test database
 */

function _loadTestEvents( cb ) {

  wn.call( fixtures.clearAll )

  .then( function() {

    return wn.call( fixtures.load, 'users', 'gaetan' )

  } )

  .then( function( u ) {

    testData.u = u;

    return wn.call( fixtures.load, 'locations', 'rivoli59', { ownerId: testData.u.id } );

  })

  .then( function( l ) {

    testData.l = l;

    return wn.call( fixtures.load, 'reviews', 'la-gargouille', { ownerId: testData.u.id } );

  })

  .then( function( r ) {

    testData.r = r;

    return wn.call( async.series, [
      
      async.apply( fixtures.load, 'events', 'la-semaine-du-10-octobre', { 
        updatedAt: new Date( '2014-12-14' ), 
        ownerId: testData.u.id, 
        locations: [ { uid: testData.l.uid } ] 
      } ),

      async.apply( fixtures.load, 'events', 'la-semaine-du-10-septembre', { 
        updatedAt: new Date( '2014-11-14' ), 
        ownerId: testData.u.id, 
        locations: [ { uid: testData.l.uid } ] 
      } ),

      async.apply( fixtures.load, 'events', 'les-particulieres-2014', { 
        updatedAt: new Date( '2014-10-14' ), 
        ownerId: testData.u.id, 
        locations: [ { uid: testData.l.uid } ] 
      } )

    ] );

  })

  .then( function( e ) {

    testData.e = e;

    model.events().list( function( err, events ) {

      async.each( events, function( e, ecb ) {

        model.reviews().instance( testData.r ).addEvent( e, { id : testData.u.id }, ecb );

      }, cb );

    });

  });

}