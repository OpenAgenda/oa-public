"use strict";

var t = require( './lib/lib' ),

w = require( 'when' ),

wn = require( 'when/node' ),

coms = require( '../lib/coms' ),

userSvc = require( '../services/invitations/invitations' );

describe( 'contributive agenda', function() {

  var browser,

  agenda = {},

  user = {};

  before( function( done ) {

    t.boot( true, done );

  });

  beforeEach( t.fixtures.clearAll );

  beforeEach( function( done ) {

    t.loadBrowser( function( err, b ) {

      browser = b;

      done();

    });

  });

  beforeEach( t.sets.prepareOneAgendaInstance( agenda, 'contributive' ) );

  beforeEach( function( done ) {

    agenda.setCredential( 'editors', done );

  });

  beforeEach( function( done ) {

    t.fixtures.load( 'users', 'jenny', function( err, u ) {

      user = u

      done();

    });

  });

  beforeEach( function( done ) {

    t.model.lib.query( 'delete from conversation', done );

  });

  it( 'add button is visible on agenda', function( done ) {

    browser.visit( '/' + agenda.slug )

    .then( function() {

      browser.assert.style( '#add-event', 'display', '' );

    })

    .done( done, _err );

  });


  it( 'invitation is created by admin', function( done ) {

    this.timeout( 10000 );

    _sendInvitation( browser, agenda, user )

    .then(function( i ) {

      i.email.should.equal( user.email );
      i.type.should.equal( 1 );
      i.reviewId.should.equal( agenda.id );

    })

    .done( done , _err );

  });


  it( 'uninvited user is led to request an invitation form', function( done ) {

    this.timeout( 10000 );

    _signin( browser, { email: user.email, password: 'bisounoursjaunedevant' } )

    .then( null, _p( browser, 'visit', '/' + agenda.slug ) )

    .then( _p( browser, 'clickLink', '#add-event' ) )

    .then( null, function() {

      browser.location.pathname.indexOf( 'a-contributive-agenda/addevent/uninvited' ).should.not.equal( -1 );

    } )

    .done( done, _err );

  } );


  it( 'uninvited user becomes contributor through request an invitation form', function( done ) {

    this.timeout( 20000 );

    _signin( browser, { email: user.email, password: 'bisounoursjaunedevant' } )

    .then( null, _p( browser, 'visit', '/' + agenda.slug ) )

    .then( _p( browser, 'clickLink', '#add-event' ) )

    .then( null, function() {

      browser.fill( 'request[message]', 'a descriptive message' );
      
      return browser.pressButton( 'submitrequest' );

    } )

    .then( _visit( browser, '/signout' ) )

    .then( _visit( browser, '/signin' ) )

    .then( function() {

      browser.fill( 'email', 'gaetan@cibul.net' );

      browser.fill( 'password', 'wigglypoof' );

      return browser.pressButton( 'signin' );

    } )

    .then( null, function() {

      return w.promise( function( resolve, reject ) {

        t.model.lib.query( 'select * from conversation limit 0, 1', function( err, rows ) {

          var mUid = rows[ 0 ].uid;

          browser.visit( '/frontend_test.php/messages/' + mUid + '/invite', function() {

            resolve();

          });

        })

      })

    } )

    .then( function() {

      return wn.call( agenda.isContributor, user );

    })

    .then( function( is ) {

      is.should.equal( true );

    })

    .done( done, _err );

  });


  it( 'user becomes contributor on activation of account', function( done ) {

    this.timeout( 10000 );

    var iToken;

    _sendInvitation( browser, agenda, { email: 'newguy@cibul.net' } )

    .then( _visit( browser, '/signout' ) )

    .then( function() {

      return wn.call( t.model.invitations().get );

    })

    .then( function( i ) {

      iToken = i.token;

      return browser.visit( '/signup?iToken=' + iToken );

    })

    .then( function() {

      browser.fill( 'full_name', 'new guy' );

      browser.fill( 'email', 'whateveremail@cibul.net' );

      browser.fill( 'password', 'pwd');

      browser.fill( 'repeat', 'pwd' );

      return browser.pressButton( 'signup' );

    })

    .then( function() {

      return wn.call( t.model.tokens().get );

    })

    .then( function( token ) {

      return browser.visit( '/activate/' + token.token + '?iToken=' + iToken)

    })

    .then( null, function() {

      return w.promise( function( resolve ) {

        // user should be a contributor of agenda now

        t.model.lib.query( 'select * from reviewer', function( err, rows ) {

          rows.length.should.equal( 1 );

          resolve();

        })  

      });

    })

    .done( done, _err );

  })


  it( 'processed invited user is led to form', function( done ) {

    this.timeout( 10000 );

    _sendInvitation( browser, agenda, user )

    .then(function( i ) {

      return wn.call( userSvc.processInvitation, { invitationId: i.id } );

    } )

    .then( _visit( browser, '/signout' ) )

    .then( function() {

      return _signin( browser, { email: user.email, password: 'bisounoursjaunedevant' } );

    } )  

    .then( null, _p( browser, 'visit', '/' + agenda.slug ) )

    .then( _p( browser, 'clickLink', '#add-event' ) )

    .then( function() {

      browser.location.pathname.should.equal( '/frontend_test.php/a-contributive-agenda/addevent' );

    })

    .done( done, _err );

  } );


  it( 'agenda requiring additional contributor info leads new invited user to info form', function( done ) {

    this.timeout( 10000 );

    _sendInvitation( browser, agenda, user, true )

    .then(function( i ) {

      return wn.call( userSvc.processInvitation, { invitationId: i.id } );

    } )

    .then( _visit( browser, '/signout' ) )

    .then( function() {

      return _signin( browser, { email: user.email, password: 'bisounoursjaunedevant' } );

    } )  

    .then( null, _p( browser, 'visit', '/' + agenda.slug ) )

    .then( _p( browser, 'clickLink', '#add-event' ) )

    .then( function() {

      browser.location.pathname.should.equal( '/frontend_test.php/a-contributive-agenda/addevent/signup' );

    })

    .done( done, _err );

  } );

  it( 'agenda with "activating invitation" credential automatically activates invited users that sign up', function( done ) {

    this.timeout( 25000 );

    wn.call( agenda.setCredential, 'activatingInvitations' )

    .then( function( ) {

      return _sendInvitation( browser, agenda, { email: 'newdude@cibul.net', password: 'wigglypoof' } );

    })

    .then( _visit( browser, '/signout' ) )

    .then( _visit( browser, '/signup' ) )

    .then( function() {

      browser.fill( 'email', 'newdude@cibul.net' );

      browser.fill( 'password', 'wigglypoof' );

      browser.fill( 'repeat', 'wigglypoof' );      

      return browser.pressButton( 'signup' );

    })

    .then( null, function() {

      browser.location.pathname.should.equal( '/frontend_test.php/home' );

    })

    .done( done, _err );

  });

});




function _sendInvitation( browser, agenda, user, requireInfo ) {

  return _signin( browser, { email: 'gaetan@cibul.net', password: 'wigglypoof' } )

  .then( null, _p( browser, 'visit', '/frontend_test.php/' + agenda.slug + '/admin/contributors' ) )

  .then( _p( browser, 'pressButton', '#save-contribution-settings' ) )

  .then( requireInfo ? function() {

    browser.check( 'fields[organization]' );

  }: null )

  .then( _p( browser, 'pressButton', '#save-contributor-info' ) )

  .then( function() {

    browser.fill( 'editors', user.email );

    return browser.pressButton( '#send-invitations' );

  })

  .then( function() {

    return wn.call( t.model.invitations().get, {} );

  } );

}

function _signin( browser, user ) {

  return browser.visit( '/signin' )

  .then( function() {

    browser.fill( 'email', user.email );

    browser.fill( 'password', user.password );

    return browser.pressButton( 'signin' );

  } );

}

function _p( b, m, s ) {

  return function() {

    return b[m](s);

  }

}


function _visit( b, p ) {

  return function() {

    return b.visit( p );

  }

}

function _err( err ) {

  console.log( err );

}