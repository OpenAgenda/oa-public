"use strict";

var t = require( './lib/lib' ),

should = require( 'should' );

describe( 'agenda signup', function() {

  this.timeout( 10000 );

  var browser,

  agenda = {},

  activationRgx = /https\:\/\/d\.openagenda\.com\/la\-gargouille\/activate\/([0-9]|[a-z])+/;

  before( function( done ) {

    t.boot( true, done );

  });

  after( t.shutdown );

  beforeEach( t.fixtures.clearAll );

  beforeEach( function( done ) {

    t.loadBrowser( function( err, b ) {

      browser = b;

      done();

    });

  });

  beforeEach( t.sets.prepareOneAgendaInstance( agenda, 'la-gargouille' ) );

  beforeEach( t.clearStore );


  it( 'a wrong signup redirects to agenda signup page', function( done ) {

    browser.visit( '/la-gargouille/signup' )

    .then( function() {

      return browser.pressButton( 'signup' );

    } )

    .then( function() {

      browser.location.pathname.should.equal( '/la-gargouille/signup' );

      done();

    });

  } );


  it( 'a successful signup redirects to agenda complete page', function( done ) {

    browser.visit( '/la-gargouille/signup' )

    .then( _fillValidData( browser ) )

    .then( function() {

      browser.location.pathname.should.equal( '/la-gargouille/signup/complete' );

      done();

    });

  });


  it( 'a successful signup triggers the queuing of a validation email containing an activation link', function( done ) {

    t.coms.consume( 'mailer', function( err, email ) {

      activationRgx.test( email.text ).should.equal( true );

      done();

    });

    browser.visit( '/la-gargouille/signup' )

    .then( _fillValidData( browser ) );

  } );


  it( 'following an activation link after an agenda signup leads to the agenda page', function( done ) {

    t.coms.consume( 'mailer', function( err, email ) {

      browser.visit( email.text.match( activationRgx )[ 0 ] )

      .then( function() {

        browser.location.pathname.should.equal( '/la-gargouille' );

        done();

      } );

    });

    browser.visit( '/la-gargouille/signup' )

    .then( _fillValidData( browser ) );

  });

});

function _fillValidData( browser ) {

  return function() {

    browser.fill( 'full_name', 'zoubi' );

    browser.fill( 'email', 'lamouche@cibul.net' );

    browser.fill( 'password', 'pwd!');

    browser.fill( 'repeat', 'pwd!' );

    return browser.pressButton( 'signup' );

  }

}