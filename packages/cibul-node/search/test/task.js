"use strict";

/**
 * test syncing of elasticsearch
 */

process.env.NODE_ENV = 'test';

const log = require( '@openagenda/logs' )( 'search sync tests' );

var config = require( '../../config' ),

should = require( 'should' ),

bogusComs = require( '../../test/helpers/bogusComs' ),

ES = require( '@openagenda/es-node' )( config.es ),

task = require( '../task' ),

helpers = require( './helpers/helpers' ),

async = require( 'async' ),

model = require( 'cibulModel' )( config.db ),

init = require( '../../lib/init' ),

fixtureData;

task.setComs( bogusComs );

describe( 'search index sync', function() {

  this.timeout( 20000 );

  before( done => {

    init.agendaLocations( {}, done );

  } );

  before( function( done ) {

    // prepare db test data ( one review & 3 events )
    helpers.prepare( function( err, fData ) {

      fixtureData = fData;

      task();

      // rebuild index

      task.setOnComplete( done );

      bogusComs.publish( config.es.channel, { name: 'index.resync', values: { reset: true } } );

    } );

  });


  it( 'fixture events should be in index', function( done ) {

    async.eachSeries( fixtureData.events, function( fEvent, ecb ) {

      let requestedId = fEvent.id;

      ES.events().get( fEvent.id + '@' + fixtureData.reviews[0].id, function( err, result ) {

        result.found.should.be.true;

        result.data.eventId.should.equal( requestedId );

        ecb();

      } );

    }, done );

  });


  it( 'fixture reviews should be in index', function( done ) {

    async.eachSeries( fixtureData.reviews, function( fReview, ecb ) {

      var requestedTitle = fReview.title;

      ES.reviews().get( fReview.id, function( err, result ) {

        result.found.should.be.true;

        result.data.title.should.equal( requestedTitle );

        ecb();

      } );

    }, done );

  });


  it( 'event should be removed from index', function( done ) {

    var eventToDelete = fixtureData.events[ fixtureData.events.length -1 ];

    helpers.eventExistsInIndex( eventToDelete.id + '@' + fixtureData.reviews[0].id, function( exists ) {

      exists.should.be.true;

      bogusComs.publish( config.es.channel, { name: 'event.delete', values: { id: eventToDelete.id } } );

    });

    task.setOnComplete( function() {

      helpers.eventExistsInIndex( eventToDelete.id + '@' + fixtureData.reviews[0].id, function( exists ) {

        exists.should.be.false;

        done();

      });

    });

  } );


  it( 'unpublished event should be added to index', function( done ) {

    var unpublishedEvent = fixtureData.unpublishedEvent;

    task.setOnComplete( function() {

      helpers.eventExistsInIndex( unpublishedEvent.id + '@' + fixtureData.reviews[0].id, function( exists ) {

        exists.should.be.true;

        done();

      } );

    });

    bogusComs.publish( config.es.channel, { 
      name: 'event.publish', 
      values: { id: unpublishedEvent.id } 
    });

  });


  it( 'event should be added to index', function( done ) {

    var eventToAdd = fixtureData.events[ fixtureData.events.length - 1 ];

    helpers.eventExistsInIndex( eventToAdd.id + '@' + fixtureData.reviews[0].id, function( exists ) {

      exists.should.be.false;

      bogusComs.publish( config.es.channel, { name: 'event.publish', values: { id: eventToAdd.id } })

    });

    task.setOnComplete( function() {

      helpers.eventExistsInIndex( eventToAdd.id + '@' + fixtureData.reviews[0].id, function( exists ) {

        exists.should.be.true;

        done();

      });

    })

  });


  it( 'event should be updated in index', function( done ) {

    var eventToChange = fixtureData.events[0],

    oldTitle = eventToChange.title.fr,

    newTitle = 'Prenez un chewing gum Emile';

    ES.events().get( eventToChange.id + '@' + fixtureData.reviews[0].id, function( err, result ) {

      result.data.title.fr.should.equal( oldTitle );

      model.lib.update( 'eventTranslations', { id: eventToChange.id, title: newTitle }, function( err ) {

        if ( err ) throw err;

        bogusComs.publish( config.es.channel, { name: 'event.update', values: { id: eventToChange.id } });

      });

    } );

    task.setOnComplete( function() {

      ES.events().get( eventToChange.id + '@' + fixtureData.reviews[0].id, function( err, result ) {

        result.data.title.fr.should.equal( newTitle );

        done();

      });

    });

  });


  it( 'review should be deleted in index', function( done ) {

    var reviewToDelete = fixtureData.reviews[0];

    helpers.reviewExistsInIndex( reviewToDelete.id, function( exists ) {

      exists.should.be.true;

      bogusComs.publish( config.es.channel, { name: 'review.delete', values: { id: reviewToDelete.id } } );

    });

    task.setOnComplete( function() {

      helpers.reviewExistsInIndex( reviewToDelete.id, function( exists ) {

        exists.should.be.false;

        done();

      });

    });

  } );

  
  it( 'review should be added to index', function( done ) {

    var reviewtoAdd = fixtureData.reviews[0];

    helpers.reviewExistsInIndex( reviewtoAdd.id, function( exists ) {

      exists.should.be.false;

      bogusComs.publish( config.es.channel, { name: 'review.publish', values: { id: reviewtoAdd.id } } );

    });

    task.setOnComplete( function() {

      helpers.reviewExistsInIndex( reviewtoAdd.id, function( exists ) {

        exists.should.be.true;

        done();

      });

    });

  } );


  it( 'review should be updated in index', function( done ) {

    var reviewToChange = fixtureData.reviews[0],

    oldTitle = reviewToChange.title,

    newTitle = 'Mon shaman vit à L.A.';

    ES.reviews().get( reviewToChange.id, function( err, result ) {

      result.data.title.should.equal( oldTitle );

      model.lib.update( 'reviews', { id: reviewToChange.id, title: newTitle }, function( err ) {

        if ( err ) throw err;

        bogusComs.publish( config.es.channel, { name: 'review.update', values: { id: reviewToChange.id } });

      });

    } );

    task.setOnComplete( function() {

      task.unsetOnComplete();

      ES.reviews().get( reviewToChange.id, function( err, result ) {

        result.data.title.should.equal( newTitle );

        done();

      });

    });

  });


});
