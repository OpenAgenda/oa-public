"use strict";

process.env.NODE_ENV = 'test';

var aggregator = require( '../' ),

model = require( '../../model' ),

should = require( 'should' ),

es = require( '../../elasticsearch' );

describe( 'aggregator source handlings', function() {

  var sourceAgenda = {},

  aggregatorAgenda = {},

  event = {};

  beforeEach( function( done ) {

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

  it( 'source is added', function( done ) {

    aggregator.sourceAdd( sourceAgenda.id, aggregatorAgenda.id, true, function( err, result ) {

      result.added.should.equal( true );

      model.lib.query( 'select a.id from aggregator_source as s left join aggregator as a on a.id=s.aggregator_id where s.review_id = ? and a.review_id = ?', [ sourceAgenda.id, aggregatorAgenda.id ], function( err, rows ) {

        rows.length.should.equal( 1 );

        done();

      });

    });

  } );

  it( 'process source events job is created', function( done ) {

    aggregator.sourceAdd( sourceAgenda.id, aggregatorAgenda.id, true, function( err, result ) {

      setTimeout( function() {

        aggregator.test.flush( function( err, result ) {

          var r = JSON.parse( result[ 0 ] );

          result.length.should.equal( 1 );

          r.method.should.equal( 'sources.process' );

          r.args.should.eql( [sourceAgenda.id, aggregatorAgenda.id, true ] );

          done();

        });

      }, 100 );

    } );

  });


  it( 'same source cannot be added twice', function( done ) {

    aggregator.sourceAdd( sourceAgenda.id, aggregatorAgenda.id, true, function( err, result ) {

      aggregator.sourceAdd( sourceAgenda.id, aggregatorAgenda.id, true, function( err, result ) {

        result.added.should.equal( false );

        done();

      } );

    } );

  });


  it( 'source is removed', function( done ) {

    aggregator.sourceAdd( sourceAgenda.id, aggregatorAgenda.id, true, function( err, result ) {

      aggregator.sourceRemove( sourceAgenda.id, aggregatorAgenda.id, function( err, result ) {

        result.removed.should.equal( true );

        model.lib.query( 'select id from aggregator_source where review_id = ?', sourceAgenda.id, function( err, rows ) {

          rows.length.should.equal( 0 );

          done();

        });

      });

    } );

  });


  it( 'stream creates evaluate jobs', function( done ) {

    aggregator.sourceAdd( sourceAgenda.id, aggregatorAgenda.id, false, function( err, result ) {

      es.rebuild( function( err ) {

        aggregator.test.process( sourceAgenda.id, aggregatorAgenda.id, false, function() {

          sourceAgenda.events.list( {}, function( err, events ) {

            aggregator.test.flush( function( err, result ) {

              var r = result.map( function( r ) { return JSON.parse( r ); } );

              r.length.should.equal( 4 );

              r.shift();

              r.forEach( function( qElem ) {

                qElem.method.should.equal( 'evaluate.publish' );

                events.map( function( e ) { return e.id } ).indexOf( qElem.args[ 0 ] ).should.not.equal( -1 );

                qElem.args[ 1 ].should.equal( sourceAgenda.id );

                qElem.args[ 2 ].should.equal( aggregatorAgenda.id );

              });

              done();

            });

          });

        });

      } );

    } );

  });

  function _createAggregator( fixture ) {

    return function( done ) {

      model.fixtures.load( 'reviews', 'fetedelabretagne', { ownerId: event.ownerId }, function( err, a ) {

        model.lib.insert( 'aggregator', { reviewId: a.id }, function( err, agg ) {

          aggregatorAgenda = a;

          done();

        });

      } );

    }

  }

} );