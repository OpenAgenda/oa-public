"use strict";

process.env.NODE_ENV = 'test';

var t = require( './lib/lib' ),

config = require( '../config' ),

q = require( '@openagenda/queue' )( config.queues.aggregator, { redis: config.redis } ),

w = require( 'when' );

describe( 'agenda aggregator actions', function() {

  var sourceAgenda = {}, events = [], browser,

  user = {
    email: 'gaetan@cibul.net',
    password: 'wigglypoof'
  };

  this.timeout( 20000 );

  beforeEach( q.test.clear );

  beforeEach( t.sets.prepareOneAgendaInstance( sourceAgenda, 'la-gargouille' ) );

  beforeEach( function( done ) {

    sourceAgenda.events.list( {}, function( err, e ) {

      events = e;

      done();

    } );

  });

  before( function( done ) {

    t.boot( true, done );

  });

  beforeEach( function( done ) {

    t.loadBrowser( function( err, b ) {

      browser = b;

      done();

    });

  });


  it( 'click on remove in agenda admin queues a notify.unpublish', function( done ) {

    t.do.signin( browser, user, '/frontend_test.php/la-gargouille/admin' )

    .then( function() {

      browser.location.pathname.should.equal( '/frontend_test.php/la-gargouille/admin' );

      return browser.clickLink( '.js_remove_link' );

    } )

    .done( function() {

      q.test.flush( function( err, flushed ) {

        flushed.length.should.equal( 1 );

        var f = JSON.parse( flushed[ 0 ] );

        f.method.should.equal( 'notify.unpublish' );

        f.args[ 0 ].should.equal( events[ 0 ].id );

        f.args[ 1 ].should.equal( sourceAgenda.id );

        done();

      });

    })

  } );

  it( 'change state to unpublished in event page queues a notify.unpublish, opposite queues a notify.publish', function( done ) {

    var eventUrl = '/la-gargouille/events/' + events[ 0 ].slug;

    t.do.signin( browser, user, eventUrl )

    .then( function() {

      browser.location.pathname.should.equal( eventUrl );

      return browser.clickLink( '.js_change_state_to_0' );

    } )

    .then( function() {

      return w.promise( function( rs, rj ) {

        browser.location.pathname.should.equal( eventUrl );

        q.test.flush( function( err, flushed ) {

          flushed.length.should.equal( 1 );

          var f = JSON.parse( flushed[ 0 ] );

          f.method.should.equal( 'notify.unpublish' );

          f.args[ 0 ].should.equal( events[ 0 ].id );

          f.args[ 1 ].should.equal( sourceAgenda.id );

          rs();

        });

      });

    })

    .then( function() {

      browser.location.pathname.should.equal( eventUrl );

      return browser.clickLink( '.js_change_state_to_2' );

    })

    .done( function() {

      q.test.flush( function( err, flushed ) {

        flushed.length.should.equal( 1 );

        var f = JSON.parse( flushed[ 0 ] );

        f.method.should.equal( 'notify.publish' );

        f.args[ 0 ].should.equal( events[ 0 ].id );

        f.args[ 1 ].should.equal( sourceAgenda.id );

        done();

      });

    });

  } );

  it( 'adding an event from add to my agenda button queues a notify.publish', function( done ) {

    w.promise( function( rs, rj ) {

      sourceAgenda.removeEvent( events[ 0 ], rs );

    })

    .then( function() {

      return t.do.signin( browser, user, '/events/' + events[ 0 ].slug + '/action' );

    })

    .then( function() {

      return browser.clickLink( 'La Gargouille' );

    } )

    .done( function() {

      q.test.flush( function( err, flushed ) {

        flushed.length.should.equal( 1 );

        var f = JSON.parse( flushed[ 0 ] );

        f.method.should.equal( 'notify.publish' );

        f.args[ 0 ].should.equal( events[ 0 ].id );

        f.args[ 1 ].should.equal( sourceAgenda.id );

        done();

      });

    });
    

  } );

} );