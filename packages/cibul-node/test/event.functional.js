"use strict";

var testLib = require( './lib/lib' ),

should = require( 'should' ),

config = require( '../config' ),

async = require( 'async' );

describe( 'event display', function() {

  this.timeout( 10000 );

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

      user.password = 'cibulon';

      testLib.do.signin( browser, user, '/events/' + event.slug )

      .then( function() {

        browser.statusCode.should.equal( 200 );

        done();

      });

    });

  });

} );


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
