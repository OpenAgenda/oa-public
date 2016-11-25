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

} );


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
        aggregatorId: agenda.id,
        type: 1
      }, done );

    } );

  });


  it( 'event redirects to signin for unlogged user', done => {

    browser.visit( eventUrl, function( err ) {

      browser.location.pathname.should.equal( '/la-gargouille/signup' )

      done();

    } );

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
