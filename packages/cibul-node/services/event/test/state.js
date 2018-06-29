"use strict";

process.env.NODE_ENV = 'test';

const instanciate = require( '../instance' ),

cbm = require( '../../model' ),

should = require( 'should' ),

TYPES = cbm.events().STATETYPES,

fixtureSets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

config = require( '../../../config' ),

coms = require( '../../../lib/coms' );

describe( 'event state changes', function() {

  const agenda = {}, event = {};

  before( fixtureSets.prepareOneAgendaInstance( agenda, 'la-gargouille' ) );

  before( function( done ) {

    agenda.events.get( {}, function( err, e ) {

      event = instanciate( e );

      done();

    });

  });

  it( 'event state is changed to validated', done => {

    event.setState( TYPES.VALIDATED, function( err ) {

      cbm.lib.query( 'select state from review_article where event_id = ? and review_id = ? limit 0,1', [ event.id, event.reviewId ], function( err, rows ) {

        rows[ 0 ].state.should.equal( TYPES.VALIDATED );

        done();

      } );

    } );

  } );

  it( 'event state is changed to not validated', function( done ) {

    event.setState( TYPES.NOTVALIDATED, function( err ) {

      cbm.lib.query( 'select state from review_article where event_id = ? and review_id = ? limit 0,1', [ event.id, event.reviewId ], function( err, rows ) {

        rows[ 0 ].state.should.equal( TYPES.NOTVALIDATED );

        done();

      } );

    } );

  });

  it( 'event state is changed to published', function( done ) {

    event.setState( TYPES.PUBLISHED, function( err ) {

      cbm.lib.query( 'select state from review_article where event_id = ? and review_id = ? limit 0,1', [ event.id, event.reviewId ], function( err, rows ) {

        rows[ 0 ].state.should.equal( TYPES.VALIDATED );

        done();

      } );

    });

  });

  it( 'when state is changed, an update is thrown on main channel', function( done ) {

    const cli = coms.subscribe( config.mainChannel, function( err, data ) {

      data.name.should.equal( 'event.update' );

      data.values.id.should.equal( event.id )

      cli.end();

      done();

    } );

    event.setState( TYPES.NOTVALIDATED, function() {} );

  } );

} );


/**
 * here i want to test that when I change the state
 *
 * it is effectively reflected in db
 *
 * a coms event is sent
 *
 * a publish sets publish and validated
 * a validate sets validated and unsets published
 * an unvalidate unsets every damn thing
 *
 * once those tests are done, I can do the 
 * controllers, then the filters, then
 * reflect state in elasticsearch for csv
 * export.
 */