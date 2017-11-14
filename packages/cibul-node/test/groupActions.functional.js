"use strict";

process.env.NODE_ENV = 'test';

var t = require( './lib/lib' ),

config = require( '../config' ),

q = require( '@openagenda/queue' )( config.queues.groupActions, { redis: config.redis } );

describe( 'agenda group actions', function() {

  this.timeout( 20000 );

  var browser,

  agenda = {},

  user = {
    email: 'gaetan@cibul.net',
    password: 'wigglypoof'
  };

  before( function( done ) {

    t.boot( true, done );

  });

  beforeEach( function( done ) {

    t.loadBrowser( function( err, b ) {

      browser = b;

      done();

    });

  });

  beforeEach( q.test.clear );

  beforeEach( t.sets.prepareOneAgendaInstance( agenda, 'la-gargouille' ) );

  it( 'a triggered group action control gets into queue', function( done ) {

    t.do.signin( browser, user, '/frontend_test.php/la-gargouille/admin' )

    .then( function() {

      browser.location.pathname.should.equal( '/frontend_test.php/la-gargouille/admin' );

      return browser.select( '#change-state select', '1' );

    })

    .then( function() {

      return browser.pressButton( '#change-state button' );

    } )

    .done( function() {

      browser.location.pathname.should.equal( '/frontend_test.php/la-gargouille/admin' );

      setTimeout( function() {

        q.test.flush( function( err, flushed ) {

          flushed.length.should.equal( 1 );

          var f = JSON.parse( flushed[ 0 ] );

          f.method.should.equal( 'dispatchChangeEventStates' );

          f.args[ 0 ].should.equal( agenda.id );

          f.args[ 1 ].should.equal( 1 );

          done();

        });

      }, 100 );

    });

  } );

});