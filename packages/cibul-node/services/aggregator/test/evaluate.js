"use strict";

process.env.NODE_ENV = 'test';

var aggregator = require( '../' ),

model = require( '../../model' ),

should = require( 'should' );

describe( 'aggregator evaluate', function() {

  var sourceAgenda = {},

  aggregatorAgenda = {},

  event = {};

  beforeEach( function( done ) {

    aggregatorAgenda = {};

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

  it( 'should reference event in aggregator', function( done ) {

    aggregator.test.evaluate.publish( event.id, sourceAgenda.id, aggregatorAgenda.id, function( err, result ) {

      result.alreadyReferenced.should.equal( false );

      result.added.should.equal( true );

      model.lib.query( 'select id, store from review_article where review_id = ? and event_id = ?', [ aggregatorAgenda.id, event.id ], function( err, rows ) {

        rows.length.should.equal( 1 );        

        done();

      });

    } );

  } );

  it( 'should remove event from aggregator', function( done ) {

    aggregator.test.evaluate.publish( event.id, sourceAgenda.id, aggregatorAgenda.id, function( err, result ) {

      aggregator.test.evaluate.unpublish( event.id, sourceAgenda.id, aggregatorAgenda.id, function( err, result ) {

        should( err ).equal( null );

        result.removed.should.equal( true );

        done();

      });

    } );

  });


  it( 'should add source reference in event listing in aggregator', function( done ) {

    aggregator.test.evaluate.publish( event.id, sourceAgenda.id, aggregatorAgenda.id, function( err, result ) {

      model.lib.query( 'select id, store from review_article where review_id = ? and event_id = ?', [ aggregatorAgenda.id, event.id ], function( err, rows ) {

        JSON.parse( rows[ 0 ].store ).sources[ 0 ].should.equal( sourceAgenda.id );

        done();

      });

    } );

  });


  it( 'if event is already listed, source reference is not added on evaluation', function( done ) {

    aggregatorAgenda.addEvent( event, { id: event.ownerId }, function( err ) {

      aggregator.test.evaluate.publish( event.id, sourceAgenda.id, aggregatorAgenda.id, function( err, result ) {

        result.added.should.equal( false );

        result.alreadyReferenced.should.equal( true );

        model.lib.query( 'select id, store from review_article where review_id = ? and event_id = ?', [ aggregatorAgenda.id, event.id ], function( err, rows ) {

          should( rows[ 0 ].store ).equal( null );

          done();

        } );

      });

    });

  } );


  it( 'if event is already listed and has been referenced through other source agenda, source reference is added', function( done ) {

    aggregatorAgenda.addEvent( event, { id: event.ownerId }, function( err ) {

      event.loadAgendaContext( aggregatorAgenda.id, function() {

        event.addSource( 333, function( err ) {

          aggregator.test.evaluate.publish( event.id, sourceAgenda.id, aggregatorAgenda.id, function( err, result ) {

            result.added.should.equal( false );

            result.alreadyReferenced.should.equal( true );

            model.lib.query( 'select id, store from review_article where review_id = ? and event_id = ?', [ aggregatorAgenda.id, event.id ], function( err, rows ) {

              var sources = JSON.parse( rows[ 0 ].store ).sources;

              sources.length.should.equal( 2 );

              sources[ 1 ].should.equal( sourceAgenda.id );

              done();

            } );

          } );

        });

      });


    } );

  });


  it( 'if source is not unique in referencing event, it should not be removed from aggregator', function( done ) {
    
    aggregator.test.evaluate.publish( event.id, sourceAgenda.id, aggregatorAgenda.id, function( err, result ) {

      event.resync();

      event.loadAgendaContext( aggregatorAgenda.id, function() {

        event.addSource( 333, function( err ) {

          aggregator.test.evaluate.unpublish( event.id, sourceAgenda.id, aggregatorAgenda.id, function( err, result ) {

            event.getSources( function( err, sources ) {

              sources.should.eql( [ { id: 333 } ] );

              done();

            } );

          } );

        } );

      } );

    } );

  } );


  function _createAggregator( fixture ) {

    return function( done ) {

      model.fixtures.load( 'reviews', 'fetedelabretagne', { ownerId: event.ownerId }, function( err, a ) {

        model.lib.insert( 'aggregator', { reviewId: a.id }, function( err, agg ) {

          model.lib.insert( 'aggregatorSource', {
            reviewId: sourceAgenda.id,
            aggregatorId: agg.insertId
          }, function( err ) {

            aggregatorAgenda = model.agendas().instance( a );

            done();

          } );

        });

      } );

    }

  }

});