"use strict";

var t = require( './lib/lib' ),

should = require( 'should' );

describe( 'signup', function() {

  var browser;

  before( function( done ) {

    t.boot( true, done );

  });

  before( function( done ) {

    t.loadBrowser( function( err, b ) {

      browser = b;

      done();

    });

  });

  beforeEach( t.clearAll );

  after( t.shutdown );

  it( 'page loads', function( done ) {

    browser.visit( '/signup', function( err ) {

      browser.statusCode.should.equal( 200 );

      done();

    } );

  } );

  it( 'empty form submit displays 3 error messages', function( done ) {

    browser.visit( '/signup', function( err ) {

      browser.pressButton( 'signup', function( err ) {

        browser.location.pathname.should.equal( '/signup' );

        browser.queryAll( '.error' ).length.should.equal( 3 );
        
        done();

      });

    });

  });

  it( 'correct entry creates inactive user', function( done ) {

    browser.visit( '/signup', function( err ) {

      _successfullSignup( browser, function( err ) {

        browser.location.pathname.should.equal( '/signup/complete' );

        t.model.users().get( { email: 'gaetan@cibul.net' }, function( err, user ) {

          user.isActivated.should.be.nok;

          done();

        });

      });

    });

  } );


  it( 'correct entry and optionals maintains optionals in validation mail', function( done ) {

    t.clearStore( function() {

      t.coms.consume( 'mailer', function( err, email ) {

        email.text.indexOf( 'iToken=123' ).should.not.equal( -1 );

        email.text.indexOf( 'redirect=456' ).should.not.equal( -1 );

        done();

      });

      browser.visit( '/signup?iToken=123&redirect=456', function( err ) {

        _successfullSignup( browser );

      });

    } );

  } );


  it ( 'erroneous email', function( done ) {

    browser.visit( '/signup', function( err ) {

      browser.fill( 'full_name', 'Gaetan' );

      browser.fill( 'email', 'grut' );

      browser.fill( 'password', 'pwd!');

      browser.fill( 'repeat', 'pwd!' );

      browser.pressButton( 'signup', function( err ) {

        browser.location.pathname.should.equal( '/signup' );

        browser.queryAll( '.error' ).length.should.equal( 1 );

        done();

      });

    });

  });

  it( 'bad retype password', function( done ) {

    browser.visit( '/signup', function( err ) {

      browser.fill( 'email', 'grut@cibul.net' );

      browser.fill( 'password', 'pwd1' );

      browser.fill( 'repeat', 'pwd2' );

      browser.pressButton( 'signup', function( err ) {

        browser.location.pathname.should.equal( '/signup' );

        browser.queryAll( '.error' ).length.should.equal( 1 );

        done();

      });

    });

  } );

  it( 'maintain optionals on wrong input', function( done ) {

    browser.visit( '/signup?iToken=123&redirect=456', function( err ) {

      browser.pressButton( 'signup', function( err ) {

        browser.location.href.indexOf( '?iToken=123&redirect=456' ).should.not.equal( -1 );

        done();

      });

    });

  });

} );


function _successfullSignup( browser, cb ) {

  browser.fill( 'full_name', 'Gaetan Latouche' );

  browser.fill( 'email', 'gaetan@cibul.net' );

  browser.fill( 'password', 'pwd!' );

  browser.fill( 'repeat', 'pwd!' );

  browser.pressButton( 'signup', function( err ) {

    if ( cb ) cb( err );

  } );

}