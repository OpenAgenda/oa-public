"use strict";

var t = require( './lib/lib' ),

should = require( 'should' );

describe( 'lost password functional', function() {

  this.timeout( 20000 );

  var browser, user = {}, a;

  before( function( done ) {

    t.boot( true, done );

  });

  beforeEach( t.sets.prepareOneUser( user, 'billy' ) );

  beforeEach( function( done ) {

    t.loadBrowser( function( err, b ) {

      browser = b;

      done();

    })

  });

  after( t.shutdown );


  it( 'signin link leads to lost password form', function( done ) {

    browser.visit( '/signin', function( err ) {

      browser.clickLink( '#lost-password', function( err ) {

        browser.location.pathname.should.equal( '/password/lost' );

        done();

      });

    });

  } );


  it( 'wrong email input displays specific message', function( done ) {

    browser.visit( '/password/lost', function( err ) {

      browser.fill( 'email', 'fdsqfdshql' );

      browser.pressButton( 'send', function( err ) {

        browser.location.pathname.should.equal( '/password/lost' );

        browser.queryAll( '.error' ).length.should.equal( 1 );

        done();

      });

    });

  } );


  it( 'right email triggers email to be sent and user to be redirected to signin', function( done ) {

    _fillAndSubmit( browser, user.email, function( err ) {

      browser.location.pathname.should.equal( '/signin' );

      done();

    });

  } );


  it( 'email link click leads to password reset form', function( done ) {

    t.clearStore( function() {

      t.coms.consume( 'mailer', function( err, mail ) {

        mail.text.indexOf( '/password/reset/' ).should.not.equal( -1 );

        done();

      });

      _fillAndSubmit( browser, user.email );

    });

  } );


  it( 'password reset link with invalid token redirects to signin', function( done ) {

    browser.visit( '/password/reset/123', function( err ) {

      browser.location.pathname.should.equal( '/signin' );

      done();

    } );

  });


  it( 'password reset link with valid token displays form', function( done ) {

    t.model.tokens().getLostPassword( { email: user.email, userId: user.id }, true, function( err, token ) {

      browser.visit( '/password/reset/' + token.token, function( err ) {

        browser.queryAll( 'input[type="password"]' ).length.should.equal( 2 );

        done();

      } );

    });

  } );

  

  it( 'empty password input displays error message', function( done ) {

    _resetForm( browser, user, function( err ) {

      browser.pressButton( 'send', function( err ) {

        browser.location.pathname.indexOf( '/password/reset/' ).should.not.equal( -1 );

        browser.queryAll( '.error' ).length.should.equal( 1 );

        done();

      });

    });

  } );


  it( 'mismatching password displays error message', function( done ) {

    _resetForm( browser, user, function( err ) {

      browser.fill( 'password', 'duchmol' );

      browser.fill( 'repeat', 'trucmuche' );

      browser.pressButton( 'send', function( err ) {

        browser.location.pathname.indexOf( '/password/reset/' ).should.not.equal( -1 );

        browser.queryAll( '.error' ).length.should.equal( 1 );

        done();

      });

    });

  } );

  it( 'correct password input updates password', function( done ) {

    _resetFormValidSubmit( browser, user, function( err ) {

      t.model.users().validateEmailAndPassword( user.email, 'duchmol', function( err, result ) {

        result.should.be.ok;

        done();

      });

    });

  } );

  it( 'correct password input redirects to signin', function( done ) {

    _resetFormValidSubmit( browser, user, function( err ) {

      browser.location.pathname.should.equal( '/signin' );

      done();

    });

  } );

  it( 'correct password input clears token', function( done ) {

    _resetFormValidSubmit( browser, user, function( err ) {

      t.model.tokens().getLostPassword( { userId: user.id }, false, function( err, result ) {

        done();

      });

    } );    

  } );

} );


function _resetForm( browser, user, cb ) {

  t.model.tokens().getLostPassword( { email: user.email, userId: user.id }, true, function( err, token ) {

    browser.visit( '/password/reset/' + token.token, cb );

  });

}

function _resetFormValidSubmit( browser, user, cb ) {

  _resetForm( browser, user, function() {

    browser.fill( 'password', 'duchmol' );

    browser.fill( 'repeat', 'duchmol' );

    browser.pressButton( 'send', cb );

  });

}


function _fillAndSubmit( browser, email, cb ) {

  browser.visit( '/password/lost', function( err ) {

    browser.fill( 'email', email );

    browser.pressButton( 'send', function( err ) {

      if ( cb ) cb( err );

    } );

  });

}