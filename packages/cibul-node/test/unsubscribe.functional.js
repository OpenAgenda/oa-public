"use strict";

var testLib = require( './lib/lib' ),

should = require( 'should' ),

wn = require( 'when/node' ),

model = require( '../services/model' );

describe( 'unsubscribe from event emailing', function() {

  this.timeout( 10000 );

  var browser, user = {};

  before( function( done ) {

    testLib.boot( true, done );

  });

  beforeEach( model.unsubscribed().clear );

  beforeEach( function( done ) {

    testLib.loadBrowser( function( err, b ) {

      browser = b;

      done();

    })

  });

  after( testLib.shutdown );

  it( 'unsubscribe with valid email adds unsubscribed entry in db', function() {

    return browser.visit( '/unsubscribe' )

    .then( function() {

      browser.statusCode.should.equal( 200 );

      browser.fill( 'email', 'unsubme@oa.com' );

      return browser.pressButton( '#submitemail' );

    } )

    .then( function() {

      browser.location.pathname.should.equal( '/' );

      return wn.call( model.unsubscribed().get, { email: 'unsubme@oa.com' } );

    } )

    .done( function( result ) {

      result.email.should.equal( 'unsubme@oa.com' );

    } );

  } );

});