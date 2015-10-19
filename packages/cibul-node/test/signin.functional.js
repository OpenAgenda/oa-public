"use strict";

var t = require( './lib/lib' ),

w = require( 'when' ),

should = require( 'should' ),

config = require( '../config' ),

async = require( 'async' ),

theRightEmail = 'billy@cibul.net';

//require( 'debug' ).enable( '*' );

describe( 'signin', function() {

  this.timeout( 10000 );

  var browser, user = {};

  before( ( done ) => {

    t.boot( true, done );

  } );

  // create one user
  beforeEach( t.sets.prepareOneUser( user, 'billy' ) );

  beforeEach( function( done ) {

    t.loadBrowser( function( err, b ) {

      browser = b;

      done();

    })

  });

  after( t.shutdown );

  it( 'page loads', ( done ) => {

    browser.visit( '/signin', function( err ) {

      browser.statusCode.should.equal( 200 );

      browser.queryAll( '.error' ).length.should.equal( 0 );

      done();

    } );

  });


  it( 'redirect is maintained to signup', ( done ) => {

    browser.visit( '/signin?redirect=123&iToken=456', function( err ) {

      browser.query( '#signup' ).getAttribute( 'href' ).split( '?' )[ 1 ].should.equal( 'iToken=456&redirect=123' );

      done();

    });

  })


  it( 'bad email', ( done ) => {

    browser.visit( '/signin', function( err ) {

      browser.fill( 'email', 'badmail@cibul.net' );

      browser.pressButton( 'signin', function( err ) {

        browser.location.pathname.should.equal( '/signin' );

        browser.queryAll( '.error' ).length.should.equal( 1 );

        done();

      } );

    } );

  });

  it( 'no password', ( done ) => {

    browser.visit( '/signin', function( err ) {

      browser.fill( 'email', 'billy@cibul.net' );

      browser.pressButton( 'signin', function( err ) {

        browser.location.pathname.should.equal( '/signin' );

        browser.queryAll( '.error' ).length.should.equal( 1 );

        done();

      });

    });

  } );

  it( 'wrong password', ( done ) => {

    browser.visit( '/signin', function( err ) {

      browser.fill( 'email', 'billy@cibul.net' );

      browser.fill( 'password', 'somethingwrong' );

      browser.pressButton( 'signin', function( err ) {

        browser.location.pathname.should.equal( '/signin' );

        browser.queryAll( '.error' ).length.should.equal( 1 );

        done();

      });

    } );

  });


  it( 'successful signin - updates last_signin in user profile', ( done ) => {

    w.promise( ( rs, rj ) => {

      t.model.lib.query( 'select last_signin from user where email = ?', theRightEmail, ( err, rows ) => {

        should( rows[ 0 ].last_signin ).equal( null );

        rs();

      } )

    } )

    .then( () => {

      return browser.visit( '/signin' );

    })

    .then( () => {

      return w.promise( ( rs, rj ) => {

        _successfullSignin( browser, function( err ) {

          rs();

        });

      });

    })

    .then( () => {

      t.model.lib.query( 'select last_signin from user where email = ?', theRightEmail, ( err, rows ) => {

        should( rows[ 0 ].last_signin ).not.equal( null );

        done();

      } );

    });

  });


  it( 'successful signin - redirect to home', ( done ) => {

    browser.visit( '/signin', function( err ) {

      _successfullSignin( browser, function( err ) {

        browser.location.pathname.should.equal( '/frontend_test.php/home' );

        done();

      });

    });

  });


  it( 'successful signin - redirect to other page', ( done ) => {

    this.timeout( 10000 );

    browser.visit( '/frontend_test.php/termsofuse', function( err ) {

      browser.clickLink( '.js_signin_link', function( err ) {

        _successfullSignin( browser, function( err ) {

          browser.location.pathname.should.equal( '/frontend_test.php/termsofuse' );

          done();

        });

      } );

    } );

  });


  it( 'successful signin - session cookie is updated', ( done ) => {

    browser.visit( '/signin', function( err ) {

      var cookieBefore, cookieAfter;

      cookieBefore = browser.getCookie( config.session.name );

      _successfullSignin( browser, function( err ) {

        cookieAfter = browser.getCookie( config.session.name );

        cookieAfter.should.not.equal( cookieBefore );

        done();

      });

    });

  });

  it( 'successful signin - session values are stored in redis', function( done ) {

    browser.visit( '/signin', function( err ) {

      _successfullSignin( browser, function( err ) {

        var sessionCookie = browser.getCookie( config.session.name );

        t.redisGet( config.session.storePrefix + sessionCookie, function( err, value ) {

          should( JSON.parse( value ).id ).equal( user.id );

          done();

        } );

      });

    });

  });

  it( 'successful signout - user is redirected to landing page', function( done ) {

    browser.visit( '/signin', function( err ) {

      _successfullSignin( browser, function( err ) {

        browser.visit( '/signout', function( err ) {

          browser.location.pathname.should.equal( '/' );

          done();

        });

      } );

    } );    

  });

  it( 'successful signout - session cookie value changes', function( done ) {

    browser.visit( '/signin', function( err ) {

      _successfullSignin( browser, function( err ) {

        var cookieBefore = browser.getCookie( config.session.name );

        browser.visit( '/signout', function( err ) {

          cookieBefore.should.not.equal( browser.getCookie( config.session.name ) );

          done();

        });

      } );

    } );

  });

  it( 'successful signout - redis store is cleared', function( done ) {

    browser.visit( '/signin', function( err ) {

      _successfullSignin( browser, function( err ) {

        var cookieBefore = browser.getCookie( config.session.name );

        browser.visit( '/signout', function( err ) {

          t.redisGet( config.session.storePrefix + cookieBefore, function( err, value ) {

            should( value ).equal( null );

            done();

          } );

        });

      } );

    } );

  });

});


/**
 * avoid repetition of typing good username & password
 */

function _successfullSignin( browser, cb ) {

  browser.fill( 'email', theRightEmail );

  browser.fill( 'password', "bisounoursvertapois" );

  browser.pressButton( 'signin', cb );

}