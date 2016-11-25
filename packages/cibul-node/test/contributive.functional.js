"use strict";

var t = require( './lib/lib' ),

w = require( 'when' ),

wn = require( 'when/node' ),

userSvc = require( '../services/invitation' ),

mailer = require( 'mailer' );

describe( 'contributive agenda', function () {

  this.timeout( 30000 );

  var browser,

  agenda = {},

  user = {};

  before( done => t.boot( true, done ) )

  beforeEach( t.fixtures.clearAll );

  beforeEach( done => t.coms.clearQueue( 'jobs', done ) );

  beforeEach( done => t.coms.clearQueue( 'mailer', done ) );

  beforeEach( done => {

    t.loadBrowser( ( err, b ) => {

      browser = b;

      done();

    } );

  } );

  beforeEach( t.sets.prepareOneAgendaInstance( agenda, 'contributive' ) );

  beforeEach( done => agenda.setCredential( 'editors', done ) );

  beforeEach( ( done ) => {

    t.fixtures.load( 'users', 'jenny', ( err, u ) => {

      user = u

      done();

    } );

  } );

  beforeEach( done => t.model.lib.query( 'delete from conversation', done ) );

  afterEach( () => {

    mailer.test.client.setOnQueuedMail( false );

  } );


  it( 'add button is visible on agenda', ( done ) => {

    browser.visit( '/' + agenda.slug )

    .then( null, function() {

      browser.assert.style( '#add-event', 'display', '' );

    })

    .done( done, _err );

  } );


  it( 'invitation is created by admin', done => {

    _sendInvitation( browser, agenda, user, true )

    .then( i  => {

      i.email.should.equal( user.email );
      i.type.should.equal( 1 );
      i.reviewId.should.equal( agenda.id );

    } )

    .done( done , _err );

  } );


  it( 'invitation created by user references user as creator', done => {

    _sendInvitation( browser, agenda, user, true )

    .then( i  => {

      i.creatorId.should.equal( agenda.ownerId );

    } )

    .done( done, _err );

  } );


  it( 'uninvited user is led to request an invitation form', done => {

    _signin( browser, { email: user.email, password: 'bisounoursjaunedevant' } )

    .then( _p( browser, 'visit', '/' + agenda.slug ) )

    .then( _p( browser, 'clickLink', '#add-event' ) )

    .then( null, () => {

      browser.location.pathname.indexOf( 'a-contributive-agenda/addevent/uninvited' ).should.not.equal( -1 );

    } )

    .done( done, _err );

  } );


  it( 'uninvited user becomes contributor through request an invitation form', done => {

    _signin( browser, { email: user.email, password: 'bisounoursjaunedevant' } )

    .then( _p( browser, 'visit', '/' + agenda.slug ) )

    .then( _p( browser, 'clickLink', '#add-event' ) )

    .then( () => {

      browser.fill( 'request[message]', 'a descriptive message' );
      
      return browser.pressButton( 'submitrequest' );

    } )

    .then( _visit( browser, '/signout' ) )

    .then( _visit( browser, '/signin' ) )

    .then( () => {

      browser.fill( 'email', 'gaetan@cibul.net' );

      browser.fill( 'password', 'wigglypoof' );

      return browser.pressButton( 'signin' );

    } )

    .then( () => {

      return w.promise( ( resolve, reject ) => {

        t.model.lib.query( 'select * from conversation limit 0, 1', function( err, rows ) {

          var mUid = rows[ 0 ].uid;

          browser.visit( '/frontend_test.php/messages/' + mUid + '/invite', function() {

            resolve();

          });

        })

      })

    } )

    .then( () => {

      return wn.call( agenda.isContributor, user );

    })

    .then( is => {

      is.should.equal( true );

    })

    .done( done, _err );

  });


  it( 'user becomes contributor on activation of account', done => {

    var iToken;

    _sendInvitation( browser, agenda, { email: 'newguy@cibul.net' } )

    .then( _visit( browser, '/signout' ) )

    .then( () => {

      return w.promise( ( rs, rj ) => {

        t.coms.consume( 'jobs', ( err, values ) => {

          values.type.should.equal( 'invitation/index' );

          t.model.invitations().get( { id: values.invitationId }, ( err, i ) => {

            rs( i );

          });

        });
        
      } );

    })

    .then( i => {

      iToken = i.token;

      return browser.visit( '/signup?iToken=' + iToken );

    })

    .then( () => {

      browser.fill( 'full_name', 'new guy' );

      browser.fill( 'email', 'whateveremail@cibul.net' );

      browser.fill( 'password', 'pwd');

      browser.fill( 'repeat', 'pwd' );

      return browser.pressButton( 'signup' );

    })

    .then( () => {

      return wn.call( t.model.tokens().get );

    })

    .then( token => {

      return browser.visit( '/' + agenda.slug + '/activate/' + token.token + '?iToken=' + iToken)

    })

    .then( null, () => {

      // user should arrive on event form page
      browser.location.pathname.should.equal( '/frontend_test.php/a-contributive-agenda/addevent' );

      return w.promise( resolve => {

        // user should be a contributor of agenda now

        t.model.lib.query( 'select * from reviewer', ( err, rows ) => {

          rows.length.should.equal( 1 );

          rows[ 0 ].creator_id.should.equal( agenda.ownerId );

          resolve();

        })  

      });

    })

    .then( () => {

      return w.promise( resolve => {

        t.coms.consume( 'jobs', ( err, values ) => {

          values.type.should.equal( 'notification' );

          resolve();

        });

      });

    })

    .done( done, _err );

  });


  it( 'processed invited user is led to form', done => {

    _sendInvitation( browser, agenda, user )

    .then( i => {

      return wn.call( userSvc.processInvitation, { invitationId: i.id } );

    } )

    .then( _visit( browser, '/signout' ) )

    .then( () => {

      return _signin( browser, { email: user.email, password: 'bisounoursjaunedevant' } );

    } )

    .then( null, _p( browser, 'visit', '/' + agenda.slug ) )

    .then( _p( browser, 'clickLink', '#add-event' ) )

    .then( null, () => {

      browser.location.pathname.should.equal( '/frontend_test.php/a-contributive-agenda/addevent' );

    } )

    .done( done, _err );

  } );


  it( 'agenda requiring additional contributor info leads new invited user to info form', done => {

    _sendInvitation( browser, agenda, user, true )

    .then( i => {

      return wn.call( userSvc.processInvitation, { invitationId: i.id } );

    } )

    .then( _visit( browser, '/signout' ) )

    .then( () => {

      return _signin( browser, { email: user.email, password: 'bisounoursjaunedevant' } );

    } )  

    .then( null, _p( browser, 'visit', '/' + agenda.slug ) )

    .then( _p( browser, 'clickLink', '#add-event' ) )

    .then( () => {

      browser.location.pathname.should.equal( '/frontend_test.php/a-contributive-agenda/addevent/info' );

    })

    .done( done, _err );

  } );


  it( 'agenda with "activating invitation" credential automatically activates invited users that sign up', done => {

    this.timeout( 25000 );

    wn.call( agenda.setCredential, 'activatingInvitations' )

    .then( () => {

      return _sendInvitation( browser, agenda, { email: 'newdude@cibul.net', password: 'wigglypoof' } );

    } )

    .then( _visit( browser, '/signout' ) )

    .then( _visit( browser, '/signup' ) )

    .then( () => {

      browser.fill( 'email', 'newdude@cibul.net' );

      browser.fill( 'password', 'wigglypoof' );

      browser.fill( 'repeat', 'wigglypoof' );      

      return browser.pressButton( 'signup' );

    })

    .then( null, () => {

      browser.location.pathname.should.equal( '/frontend_test.php/home' );

    })

    .done( done, _err );

  } );


  it( 'invitation mail has codified replyTo ', done => {

    _sendInvitation( browser, agenda, { email: 'newguy@cibul.net' } )

    .then( i => {

      let d = w.defer();

      mailer.test.client.setOnQueuedMail( values => {

        values.replyTo.split( '.' )[ 0 ].should.equal( i.token );
        values.replyTo.split( '@' )[ 0 ].split( '.' )[ 2 ].should.equal( 'invitation' );

        d.resolve();

      } );

      userSvc.processInvitation( { invitationId: i.id } );

      return d.promise;

    } )

    .done( done, _err );

  } );


  it( 'invitation mail displays link leading to agenda signup form', done => {

    _sendInvitation( browser, agenda, { email: 'newguy@cibul.net' } )

    .then( i => {

      let d = w.defer();

      mailer.test.client.setOnQueuedMail( values => {

        values.text.indexOf( 'openagenda.com/a-contributive-agenda/signup?iToken=' + i.token ).should.not.equal( -1 );

        d.resolve();

      } );

      userSvc.processInvitation( { invitationId: i.id } );

      return d.promise;

    } )

    .done( done, _err );

  } );


});




function _sendInvitation( browser, agenda, user, requireInfo ) {

  return _signin( browser, { email: 'gaetan@cibul.net', password: 'wigglypoof' } )

  .then( _p( browser, 'visit', '/frontend_test.php/' + agenda.slug + '/admin/contributors' ) )

  .then( _p( browser, 'pressButton', '#save-contribution-settings' ) )

  .then( requireInfo ? () => {

    browser.check( 'fields[organization]' );

  } : null )

  .then( _p( browser, 'pressButton', '#save-contributor-info' ) )

  .then( () => {

    browser.fill( 'editors', user.email );

    return browser.pressButton( '#send-invitations' );

  })

  .then( () => {

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