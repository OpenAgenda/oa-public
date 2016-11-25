"use strict";

var t = require( './lib/lib' ),

w = require( 'when' ),

wn = require( 'when/node' ),

userSvc = require( '../services/invitation' );

describe( 'agenda administrators', function() {

  this.timeout( 10000 );

  var browser,

  agenda = {},

  user = {};

  before( function( done ) {

    t.boot( true, done );

  });

  after( t.shutdown );

  beforeEach( t.fixtures.clearAll );

  beforeEach( function( done ) {

    t.coms.clearQueue( 'jobs', done ); 

  } );

  beforeEach( function( done ) {

    t.loadBrowser( function( err, b ) {

      browser = b;

      done();

    });

  });

  beforeEach( t.sets.prepareOneAgendaInstance( agenda, 'contributive' ) );

  beforeEach( function( done ) {

    t.fixtures.load( 'users', 'jenny', function( err, u ) {

      user = u

      done();

    });

  });


  it( 'invitation is created by admin and mail is sent', function( ) {

    this.timeout( 10000 );

    return t.do.signin( browser, { 
      email: 'gaetan@cibul.net', 
      password: 'wigglypoof' 
    }, '/frontend_test.php/' + agenda.slug + '/admin/admins' )

    .then( function() {

      return w.promise( function( rs ) {

        t.coms.consume( 'jobs', function( err, values ) {

          values.action.should.equal( 'processInvitation' );

          rs();

        } );

        browser.fill( 'editors', 'somedude@cibul.net' );

        browser.pressButton( '#send-invitations' );  

      } );

    })

    .then( function() {

      return w.promise( function( rs ) {

        t.model.invitations().get( {}, function( err, i ) {

          i.email.should.equal( 'somedude@cibul.net' );
          i.type.should.equal( 2 );
          i.aggregatorId.should.equal( agenda.id );

          rs();

        });

      } );

    });

  });

});