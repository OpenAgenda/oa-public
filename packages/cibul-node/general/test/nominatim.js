"use strict";

process.env.NODE_ENV = 'test';

var config = require( '../../config' ),

log = require( 'logger' )( 'nominatim task tests' ),

async = require( 'async' ),

should = require( 'should' ),

model = require( '../../services/model' ),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( model ),

task = require( '../nominatim.task' );

// clear db and create a bunch of locations

describe( 'nominatim', function() {

  before( function( done ) {

    async.series([
      fixtures.clearAll,
      async.apply( fixtures.load, 'users', 'gaetan', { id: 1 } ),
      async.apply( fixtures.load, 'locations', 'laboisserie', { ownerId: 1, id: 1 } ),
      async.apply( fixtures.load, 'locations', 'atelierduchange', { ownerId: 1, id: 2 } ),
      async.apply( fixtures.load, 'locations', 'villette', { ownerId: 1 } ),
    ], done);

  });

  it( 'task should geocode properly', function( done ) {

    this.timeout( 60000 );

    task.setOnComplete( function() {

      model.locations().list( function( err, locations ) {

        var expected = {
          1 : { department: 'Haute-Marne' },
          2 : { region: 'Centre' },
          3 : { city_district: '19e Arrondissement' }
        };

        locations.forEach( function( l ) {

          for ( var field in expected[ l.id ] ) {

            l[ field ].should.equal( expected[ l.id ][ field ] );

          }

        });

      });

      done();

    });

    task();

  } );

});