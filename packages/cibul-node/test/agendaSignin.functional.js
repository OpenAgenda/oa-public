"use strict";

var t = require( './lib/lib' ),

should = require( 'should' );

describe( 'agenda signin', function() {

  this.timeout( 10000 );

  var browser,

  agenda = {},

  user = {
    email: 'gaetan@cibul.net',
    password: 'wigglypoof'
  };

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

  it( 'a click on add event from logged out session shows agenda signup form', function( done ) {

    browser.visit( '/la-gargouille' )

    .then( function() {

      return browser.clickLink( '#add-event' );

    })

    .then( function() {

      browser.location.pathname.should.equal( '/la-gargouille/signup' );

      done();

    });

  });

  it( 'a click on I already have an account goes to agenda signin form', function( done ) {

    browser.visit( '/la-gargouille/signup' )

    .then( function() {

      return browser.clickLink( '#signin' );

    })

    .then( function() {

      browser.location.pathname.should.equal( '/la-gargouille/signin' );

      done();

    })

  });
  

  it( 'a signin failure reloads agenda signin page', function( done ) {

    browser.visit( '/la-gargouille/signin' )

    .then( function() {

      return browser.pressButton( 'signin' );

    })

    .then( function() {

      browser.location.pathname.should.equal( '/la-gargouille/signin' );

      done();

    })

  } );


  it( 'a successful signin leads to agenda page', function( done ) {

    browser.visit( '/la-gargouille/signin' )

    .then( function() {

      browser.fill( 'email', user.email );

      browser.fill( 'password', user.password );

      return browser.pressButton( 'signin' );

    })

    .then( function() {

      browser.location.pathname.should.equal( '/la-gargouille' );

      done();

    });

  });

} );