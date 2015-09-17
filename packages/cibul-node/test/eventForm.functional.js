"use strict";

var t = require( './lib/lib' ),

should = require( 'should' );

describe( 'event form - new', function() {

  this.timeout( 10000 );

  var browser,

  agenda = {},

  addEventRes = '/frontend_test.php/la-gargouille/addevent',

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

  it( 'shows event form with fields', function( done ) {

    t.do.signin( browser, user, addEventRes )

    .then( function() {

      browser.statusCode.should.equal( 200 );

      browser.field( 'input[name=title]' ).should.be.ok;

      browser.field( 'input[name=description]' ).should.be.ok;

      browser.field( 'textarea[name=long_description]' ).should.be.ok;

      browser.field( 'input[name=ticket_link]' ).should.be.ok;

      browser.field( 'input[name=conditions]' ).should.be.ok;

      done();

    } );

  });

  /** cannot get jsonp to work 
  it( 'geocodes addresses', function( done ) {

    t.do.signin( browser, user, addEventRes )

    .then( function() {

      browser.fill( 'placename', 'Le 8' );

      browser.fill( 'address', '8 rue Alice, Courbevoie' );

      setTimeout( function() {

        done();

      }, 3000 );

    } );

  });*/

});