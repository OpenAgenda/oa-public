"use strict";

var t = require( './lib/lib' ),

w = require( 'when' );

describe( 'participative agenda', function() {

  var browser,

  agenda = {},

  user = {};

  before( function( done ) {

    t.boot( true, done );

  });

  before( function( done ) {

    t.loadBrowser( function( err, b ) {

      browser = b;

      done();

    });

  });

  after( t.shutdown );

  before( t.sets.prepareOneAgendaInstance( agenda, 'participative' ) );

  before( function( done ) {

    t.fixtures.load( 'users', 'cindy', function( err, u ) {

      user = u

      done();

    });

  });

  it( 'add button is visible on agenda', function( done ) {

    browser.visit( '/' + agenda.slug )

    .then( function() {

      browser.assert.style( '#add-event', 'display', '' );

    })

    .done( done, _err );

  });

  it( 'click on add button redirects to signin', function( done ) {

    this.timeout( 10000 );

    browser.visit( '/' + agenda.slug )

    .then( _clickLink( browser, '#add-event' ) )

    .then( function() {

      browser.location.pathname.should.equal( '/signin' );

    })

    .done( done, _err );

  } );

  it( 'click on add button adds redirect parameter for origin', function( done ) {

    this.timeout( 10000 );

    browser.visit( '/' + agenda.slug )

    .then( _clickLink( browser, '#add-event' ) )

    .then( function() {

      _b64Decode(browser.location.href.split( '?redirect=' )[ 1 ] )

      .should.equal( 'https://d.cibul.net/frontend_test.php/a-participative-agenda/addevent' );

    })

    .done( done, _err );

  } );

  it( 'signed in user clicks on add button reaches add event page', function( done ) {

    this.timeout( 10000 );

    _signin( browser, user )


    .then( null, _visit( browser, '/' + agenda.slug ) )

    .then( _clickLink( browser, '#add-event' ) )

    .then( null, function() {

      browser.location.pathname.indexOf( '/a-participative-agenda/addevent' ).should.not.equal( -1 );

    } )

    .done( done, _err );

  });

});

function _visit( b, p ) {

  return function() {

    return b.visit( p );

  }

}

function _signin( browser, user ) {

  return browser.visit( '/signin' )

  .then( function() {

    browser.fill( 'email', user.email );

    browser.fill( 'password', 'bisounoursvert' );

    return browser.pressButton( 'signin' );

  } );

}

function _b64Decode( value ) {

  return ( new Buffer( value, 'base64' ) ).toString();

}

function _clickLink( b, s ) {

  return function() {

    return b.clickLink( s );

  }

}

function _err( err ) {

  console.log( err );

}