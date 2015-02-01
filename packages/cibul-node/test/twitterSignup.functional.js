"use strict";

var testLib = require( './lib/lib' ),

should = require( 'should' ),

config = require( '../config' ),

coms = require( '../lib/coms' ),

async = require( 'async' );

//require( 'debug' ).enable( '*' );

describe( 'twitter signup', function() {

  var browser, user = {};

  before( function( done ) {

    testLib.boot( true, done );

  } );

  beforeEach( function( done ) {

    testLib.loadBrowser( function( err, b ) {

      browser = b;

      done();

    })

  });


  it( 'successful signup', function( done ) {

    this.timeout( 30000 );

    browser.visit( 'https://twitter.com', function( err ) {

      browser.fill( 'session[username_or_email]', config.auth.twitter.testAccount.email );
      browser.fill( 'session[password]', config.auth.twitter.testAccount.password );
      
      browser.pressButton( '.submit', function( err ) {

        browser.visit( '/signup', function( err ) {

          browser.clickLink( '#twitter-signup', function( err ) {

            browser.fill( 'email', config.auth.twitter.testAccount.email );

            browser.pressButton( 'submit-email', function( err ) {

              browser.location.pathname.should.equal( '/signup/complete' );

              coms.consume( 'mailer', function( err, values ) {

                values.recipient.should.equal( config.auth.twitter.testAccount.email );

                done();
                
              } );

            });


          });

        });

      });

    });

  });


  it( 'successful signup with token and redirect', function( done ) {

    this.timeout( 30000 );

    browser.visit( 'https://twitter.com', function( err ) {

      browser.fill( 'session[username_or_email]', config.auth.twitter.testAccount.email );
      browser.fill( 'session[password]', config.auth.twitter.testAccount.password );
      
      browser.pressButton( '.submit', function( err ) {

        // skip email step
        browser.visit( '/twitter/signup?iToken=1234&redirect=grut&email=' + encodeURIComponent(config.auth.twitter.testAccount.email), function( err ) {

          coms.consume( 'mailer', function( err, values ) {

            values.text.split( '?' )[ 1 ].should.equal( 'iToken=1234&redirect=grut' );

            done();
            
          } );

        } );

      } );

    } );

  });

} );