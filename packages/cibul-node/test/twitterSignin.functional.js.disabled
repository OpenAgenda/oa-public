"use strict";

var testLib = require( './lib/lib' ),

should = require( 'should' ),

config = require( '../config' ),

async = require( 'async' );

//require( 'debug' ).enable( '*' );

describe( 'twitter signin', function() {

  var browser, user = {};

  before( function( done ) {

    testLib.boot( true, done );

  } );
  
  // create one user 
  beforeEach( testLib.sets.prepareOneUser( user, 'billy', { twitterId: config.auth.twitter.testAccount.id } ) )

  beforeEach( function( done ) {

    testLib.loadBrowser( function( err, b ) {

      browser = b;

      done();

    })

  });


  it( 'successful signin', function( done ) {

    this.timeout( 30000 );

    browser.visit( 'https://twitter.com', function( err ) {

      browser.fill( 'session[username_or_email]', config.auth.twitter.testAccount.email );
      browser.fill( 'session[password]', config.auth.twitter.testAccount.password );
      
      browser.pressButton( '.submit', function( err ) {

        // we are now logged in twitter

        browser.visit( '/signin', function( err ) {

          browser.clickLink( '#twitter-signin', function( err ) {

            browser.location.pathname.should.equal( '/frontend_test.php/home' );

            done();

          } );

        });

      } );

    });


  } );

} );