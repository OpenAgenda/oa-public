var config = require( '../../../../config' ),

model = require( '../../../../services/model' ),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( model ),

async = require( 'async' ),

w = require( 'when' ),

wn = require( 'when/node' ),

lib = require( '../../../../lib/lib' ),

log = require( 'debug' )( 'events sync test helper' ),

user, review, locations = [], events = [];


exports.prepare = prepare;

function prepare( cb ) {

  wn.call( fixtures.clearAll )

  .then( function() {

    log( 'loading gaetan' );

    return wn.call( fixtures.load, 'users', 'gaetan' );

  } )

  .then( function( u ) {

    user = u;

    return wn.call( fixtures.load, 'reviews', 'chez-nous', { ownerId: user.id });

  })

  .then( function( r ) {

    review = model.reviews().instance( r );

    return wn.call( async.eachSeries, [
      'rivoli59',
      'sentierdeshalles',
      'villette'
    ], function( name, ecb ) {

      fixtures.load( 'locations', name, { ownerId: user.id }, function( err, data ) {

        if ( err ) throw err;

        locations.push( data );

        ecb();

      });

    });

  })

  .then( function() {

    var i = 0;

    return wn.call( async.eachSeries, [
      'la-semaine-du-10-octobre',
      'la-semaine-du-10-septembre',
      'les-particulieres-2014'
    ], function( name, ecb ) {

      fixtures.read( 'events', name, function( err, data ) {

        if ( err ) throw err;

        data.locations[0].uid = locations[i++].uid;

        data.ownerId = user.id;

        model.events().create( data, function( err, result ) {

          if ( err ) throw err;

          events.push( result );

          review.addEvent( result, user, ecb );

        } );

      });

    });

  })

  .done( function() {

    cb( null, {
      reviews: [ review ],
      events: events,
      users: [ user ],
      locations: locations
    });

  } );

}



function eventExistsInIndex( id, cb ) {

  ES.events().get( id, function( err, result ) {

    cb( result.found );        

  } );

};

function reviewExistsInIndex( id, cb ) {

  ES.reviews().get( id, function( err, result ) {

    cb( result.found );

  })

};