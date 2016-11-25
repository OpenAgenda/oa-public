"use strict";

process.env.NODE_ENV = 'test';

var aggregator = require( '../' ),

model = require( '../../model' ),

should = require( 'should' ),

async = require( 'async' );

describe( 'aggregator notify', function() {

  var sourceAgenda = {},

  aggregatorAgendas = [],

  event = {};

  beforeEach( function( done ) {

    aggregatorAgendas = [];

    aggregator.test.clear( function() {

      done();

    });

  } );

  beforeEach( model.fixtureSets.prepareOneAgendaInstance( sourceAgenda, 'la-gargouille' ) );

  beforeEach( function( done ) {

    sourceAgenda.events.get( {}, function( err, e ) {

      event = model.events().instance( e );

      done();

    } );

  });

  beforeEach( _createAggregator( 'fetedelabretagne' ) );

  beforeEach( _createAggregator( 'pepite' ) );


  it( 'should queue notifyPublish', function( done ) {

    aggregator.notifyPublish( event.id, sourceAgenda.id );

    // bit loose but should be enough
    setTimeout( function() {

      aggregator.test.flush( function( err, result ) {

        var r = JSON.parse( result[ 0 ] );

        result.length.should.equal( 1 );

        r.method.should.equal( 'notify.publish' );

        r.args.should.eql( [ event.id, sourceAgenda.id ] );

        done();

      });

    }, 100 );

  });

  it( 'should queue requests to evaluate publish', function( done ) {

    aggregator.notifyPublish( event.id, sourceAgenda.id, function( err, result ) {

      should( err ).equal( null );

      setTimeout( function() {

        aggregator.test.flush( function( err, result ) {

          result.length.should.equal( 2 );

          JSON.parse( result[ 0 ] ).method.should.equal( 'evaluate.publish' );

          JSON.parse( result[ 1 ] ).method.should.equal( 'evaluate.publish' );

          JSON.parse( result[ 0 ] ).args.should.eql( [ event.id, sourceAgenda.id, aggregatorAgendas[ 0 ].id ] );

          JSON.parse( result[ 1 ] ).args.should.eql( [ event.id, sourceAgenda.id, aggregatorAgendas[ 1 ].id ] );

          done();

        } );

      }, 100 );

    });

  });

  it( 'should queue notifyUnpublish', function( done ) {

    aggregator.notifyUnpublish( event.id, sourceAgenda.id );

    // bit loose but should be enough
    setTimeout( function() {

      aggregator.test.flush( function( err, result ) {

        var r = JSON.parse( result[ 0 ] );

        result.length.should.equal( 1 );

        r.method.should.equal( 'notify.unpublish' );

        r.args.should.eql( [ event.id, sourceAgenda.id ] );

        done();

      });

    }, 100 );

  });

  it( 'should queue requests to evaluate unpublish', function( done ) {

    async.eachSeries( aggregatorAgendas, function( agg, ecb ) {

      model.lib.insert( 'reviewArticles', {
        reviewId: agg.id,
        eventId: event.id,
        userId: event.ownerId,
        store: JSON.stringify( { sources: [ sourceAgenda.id ] } )
      }, ecb );

    }, function( err ) {

      aggregator.notifyUnpublish( event.id, sourceAgenda.id, function( err, result ) {

        should( err ).equal( null );

        setTimeout( function() {

          aggregator.test.flush( function( err, result ) {

            result.length.should.equal( 2 );

            JSON.parse( result[ 0 ] ).method.should.equal( 'evaluate.unpublish' );

            JSON.parse( result[ 1 ] ).method.should.equal( 'evaluate.unpublish' );

            JSON.parse( result[ 0 ] ).args.should.eql( [ event.id, sourceAgenda.id, aggregatorAgendas[ 0 ].id ] );

            JSON.parse( result[ 1 ] ).args.should.eql( [ event.id, sourceAgenda.id, aggregatorAgendas[ 1 ].id ] );

            done();

          } );

        } );

      } );

    });

  });

  function _createAggregator( fixture ) {

    return function( done ) {

      model.fixtures.load( 'reviews', 'fetedelabretagne', { ownerId: event.ownerId }, function( err, a ) {

        model.lib.insert( 'aggregator', { reviewId: a.id }, function( err, agg ) {

          model.lib.insert( 'aggregatorSource', {
            reviewId: sourceAgenda.id,
            aggregatorId: agg.insertId
          }, function( err ) {

            aggregatorAgendas.push( a );

            done();

          } );

        });

      } );

    }

  }

});


