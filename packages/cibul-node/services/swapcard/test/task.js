/**
 * test syncing of services
 */

// admin@cibul.net
//

process.env.NODE_ENV = 'test';

var config = require( '../../../config' ),

log = require( '@openagenda/logs' )( 'events sync tests' ),

should = require( 'should' ),

bogusComs = require( '../../../test/helpers/bogusComs' ),

helpers = require( './helpers/helpers' ),

model = require( '../../../services/model' ),

swapcard = require( '../' )( model, config ),

async = require( 'async' ),

fixtureData,

agenda,

tokens = {
  access: 'MDFiZmUzODI5MDgzNWM2ZjY3MWU2YmNjOWEzY2JlZGYwMjc3MTFiNTFhNTY4YzFjOGU3MjllNWNiOGIyZjk2NB',
  refresh: 'MjE2ZWU0MTQ4Y2UzM2UxN2ZhN2QzYWU5MDFkYzRmNzcxNTUwZDlhYTY5NDM0ZWMxZjM5NGVmYTljODJhZmVhMQ'
};

describe( 'events services sync', function() {

  before( function( done ) {

    this.timeout( 5000 );

    // prepare db test data ( one review & 3 events )
    helpers.prepare( function( err, fData ) {

      fixtureData = fData;

      done();

    } );

  });

  it( 'syncing review with swapcard', function( done ) {

    agenda = model.reviews().instance( fixtureData.reviews[ 0 ] );

    agenda.setStore( 'swapcard', JSON.stringify( tokens ), true, function( err ) {

      if ( err ) return done( err );

      done();

    } );

  } );

  it( 'syncing events with swapcard', function( done ) {

    this.timeout( 10000 );

    async.eachSeries( fixtureData.events, function( e, ecb ) {

      var job = {
        eventId: e.id,
        agendaId: fixtureData.reviews[ 0 ].id,
        type: 'swapcard',
        action: 'publish'
      };

      swapcard.publish( job, function( err ) {

        if ( err ) return ecb( err );

        ecb();

      } );

    }, done );

  } );

  it( 'updating events with swapcard', function( done ) {

    this.timeout( 10000 );

    async.eachSeries( fixtureData.events, function( e, ecb ) {

      var job = {
        eventId: e.id,
        agendaId: fixtureData.reviews[ 0 ].id,
        type: 'swapcard',
        action: 'update'
      };

      swapcard.update( job, function( err ) {

        if ( err ) return ecb( err );

        return ecb();

      } );

    }, done );

  } );

  it( 'deleting events with swapcard', function( done ) {

    this.timeout( 10000 );

    async.eachSeries( fixtureData.events, function( e, ecb ) {

      var job = {
        eventId: e.id,
        agendaId: fixtureData.reviews[ 0 ].id,
        type: 'swapcard',
        action: 'delete'
      };

      swapcard.delete( job, function( err ) {

        if ( err ) return ecb( err );

        ecb();

      } );

    }, done );

  } );

});
