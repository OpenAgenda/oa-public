"use strict";

var testLib = require( './lib/lib' ),

should = require( 'should' ),

config = require( '../config' ),

async = require( 'async' );

describe( 'event display', function() {

  this.timeout( 20000 );

  var browser, user = {}, event = {}, randomUser = {};

  before( function( done ) {

    testLib.boot( true, done );

  } );

  beforeEach( function( done ) {

    testLib.loadBrowser( function( err, b ) {

      browser = b;

      done();

    })

  });

  beforeEach( _createOneUserAndEvent( user, event ) );

  beforeEach( testLib.sets.addOneUser( randomUser, 'lenny' ) );

  it( 'standalone event page gives 200 status code', function( done ) {

    browser.visit( '/events/' + event.slug, function( err ) {

      browser.statusCode.should.equal( 200 );

      done();

    } );

  });

  it( 'draft event page from unlogged account gives 401 status code', function( done ) {

    event.draft( true, function() {

      browser.visit( '/events/' + event.slug, function( err ) {

        browser.statusCode.should.equal( 401 );

        done();

      });

    });

  } );

  it( 'draft event page from logged account gives 403', function( done ) {
    
    event.draft( true, function() {

      randomUser.password = 'cibulon';

      testLib.do.signin( browser, randomUser, '/events/' + event.slug )

      .then( null, function( err ) {

        browser.statusCode.should.equal( 403 );

        done();

      } );

    } );

  });

  it( 'draft event page from logged editor account gives 200', function( done ) {

    event.draft( true, function() {

      user.password = 'wigglypoof';

      testLib.do.signin( browser, user, '/events/' + event.slug )

      .then( function() {

        browser.statusCode.should.equal( 200 );

        done();

      });

    });

  });


} );


describe( 'draft in agenda', function() {

  // create an unpublished event in an agenda 
  // a owner, a agenda editor and a random user
  
  this.timeout( 20000 );

  var browser,

  user = {}, event = {}, randomUser = {}, agenda = {}, agendaOwner = {},

  eventUrl;

  before( function( done ) {

    testLib.boot( true, done );

  } );

  beforeEach( function( done ) {

    testLib.loadBrowser( function( err, b ) {

      browser = b;

      done();

    })

  });

  beforeEach( _createOneUserAndEvent( user, event ) );

  beforeEach( testLib.sets.addOneUser( randomUser, 'lenny' ) );

  beforeEach( testLib.sets.addOneUser( agendaOwner, 'cindy' ) );

  beforeEach( function( done ) {

    testLib.sets.addOneAgenda( agenda, 'la-gargouille', { ownerId: agendaOwner.id } )( done );

  } );

  beforeEach( function( done ) {

    eventUrl = '/' + agenda.slug + '/events/' + event.slug;

    event.draft( true, function( ) {

      agenda.addEvent( event, agendaOwner, function() {

        testLib.model.lib.insert( 'eventEditors', { 
          eventId: event.id,
          reviewId: agenda.id,
          type: 1
        }, done );

      } );

    } );

  });

  
  it( 'draft gives 401 to unlogged user', function( done ) {

    browser.visit( eventUrl )

    .then( null, function() {

      browser.location.pathname.should.equal( eventUrl );

      browser.statusCode.should.equal( 401 );

      done();

    });

  } );

  it( 'draft gives 403 to random logged user', function( done ) {

    randomUser.password = 'cibulon';

    testLib.do.signin( browser, randomUser, eventUrl )

    .then( null, function( err ) {

      browser.location.pathname.should.equal( eventUrl );

      browser.statusCode.should.equal( 403 );

      done();

    } );

  } );

  it( 'draft is not accessible to event owner through agenda path', function( done ) {

    user.password = 'wigglypoof';

    testLib.do.signin( browser, user, eventUrl )

    .then( null, function() {

      browser.location.pathname.should.equal( eventUrl );

      browser.statusCode.should.equal( 403 );

      done();

    });

  } );


  it( 'draft is accessible to event owner through agenda path if he is contributor', function( done ) {

    agenda.setContributor( user, function() {

      user.password = 'wigglypoof';

      testLib.do.signin( browser, user, eventUrl )

      .then( function() {

        browser.location.pathname.should.equal( eventUrl );

        browser.statusCode.should.equal( 200 );

        done();

      });

    });

  });


  it( 'draft is accessible to event editor ( agenda admin ) through agenda path', function( done ) {

    agendaOwner.password = 'bisounoursvert';

    testLib.do.signin( browser, agendaOwner, eventUrl )

    .then( function() {

      browser.location.pathname.should.equal( eventUrl );

      browser.statusCode.should.equal( 200 );

      done();

    } );

  } );

});

describe( 'unpublished in agenda', function() {

  // create an unpublished event in an agenda 
  // a owner, a agenda editor and a random user
  
  this.timeout( 20000 );

  var browser,

  user = {}, event = {}, randomUser = {}, agenda = {}, agendaOwner = {},

  eventUrl;

  before( function( done ) {

    testLib.boot( true, done );

  } );

  beforeEach( function( done ) {

    testLib.loadBrowser( function( err, b ) {

      browser = b;

      done();

    })

  });

  beforeEach( _createOneUserAndEvent( user, event ) );

  beforeEach( testLib.sets.addOneUser( randomUser, 'lenny' ) );

  beforeEach( testLib.sets.addOneUser( agendaOwner, 'cindy' ) );

  beforeEach( function( done ) {

    testLib.sets.addOneAgenda( agenda, 'la-gargouille', { ownerId: agendaOwner.id } )( done );

  } );

  beforeEach( function( done ) {

    eventUrl = '/' + agenda.slug + '/events/' + event.slug;

    agenda.addEvent( event, agendaOwner, { publish: false }, function() {

      testLib.model.lib.insert( 'eventEditors', { 
        eventId: event.id,
        reviewId: agenda.id,
        type: 1
      }, done );

    } );

  });


  it( 'unlogged user is redirected to standalone', function( done ) {

    browser.visit( eventUrl )

    .then( function() {

      browser.location.pathname.should.equal( '/events/' + event.slug );

      done();

    })

  } );


  it( 'logged user is redirected to standalone', function( done ) {

    testLib.do.signin( browser, randomUser, eventUrl )

    .then( function() {

      browser.location.pathname.should.equal( '/events/' + event.slug );

      done();

    });

  } );


  it( 'event editor can view event in agenda env', function( done ) {

    agendaOwner.password = 'bisounoursvert';

    testLib.do.signin( browser, agendaOwner, eventUrl )

    .then( function() {

      browser.location.pathname.should.equal( eventUrl );

      done();

    });

  } );

});


function _createOneUserAndEvent( userRef, eventRef ) {

  return function( cb ) {

    testLib.sets.prepareOneEventInstance( eventRef, 'les-particulieres-2014' )( function() {

      testLib.model.users().get( { id: eventRef.ownerId }, function( err, user ) {

        testLib.utils.extend( userRef, user );

        cb();

      });

    })

  }

}
