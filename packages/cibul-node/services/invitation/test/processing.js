"use strict";

process.env.NODE_ENV = 'test';

//require( 'debug' ).enable( '*' );

var should = require( 'should' ),

async = require( 'async' ),

config = require( '../../../config' ),

cbm = require( 'cibulModel' )( config.db ),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( cbm ),

sets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

svc = require( '../' ),

coms = require( '../../../lib/coms' );

require( '../../genUrl' ).init( { domain: config.domain } );


describe( 'invitation processing', function() {

  var agendas = [{}], users = [], invitations = [];

  // load one agenda and one user
  before( sets.prepareOneAgendaInstance( agendas[ 0 ], 'la-gargouille' ) );

  // load additional users
  before( function( done ) {

    async.eachSeries( [ 'freddy', 'cindy', 'jenny', 'teddy', 'lenny' ], function( fx, ecb ) {

      fixtures.load( 'users', fx, function( err, user ) {

        users.push( user );

        ecb();

      } );

    }, done );
    
  } );

  // load additional agendas
  before( function( done ) {

    async.eachSeries( [ [ 1, 'pepite'], [ 2, 'fetedelabretagne' ] ], function( fx, ecb ) {

      fixtures.load( 'reviews', fx[ 1 ], { ownerId: users[ fx[ 0 ] ].id }, function( err, a ) {

        agendas.push( cbm.agendas().instance( a ) );

        ecb();

      } );

    }, done );

  });

  // load invitations
  beforeEach( function( done ) {

    cbm.invitations().clear( function() {

      invitations = [];

      async.eachSeries( [ 
        { type: 1, userId: users[ 0 ].id, token: 123, reviewId: agendas[ 0 ].id },
        { type: 1, email: users[ 0 ].email, token: 456, reviewId: agendas[ 1 ].id },
        { type: 1, email: 'random@oa.com', token: 789, reviewId: agendas[ 2 ].id } ,
        { type: 2, userId: users[ 3 ].id, token: 101112, reviewId: agendas[ 0 ].id },
        { type: 2, email: users[ 3 ].email, token: 131415, reviewId: agendas[ 1 ].id },
        { type: 2, email: 'otherrandom@oa.com', token: 161718, reviewId: agendas[ 2 ].id }
      ], function( data, ecb ) {

        cbm.lib.insert( 'invitations', data, function( err, result ) {

          invitations.push( { id: result.insertId } );

          ecb();

        } );

      }, done );

    });


  });

  // clear contributor links
  beforeEach( function( done ) {

    cbm.lib.clear( 'reviewers', done );

  });

  beforeEach( function( done ) {

    coms.clearQueue( 'mailer', done );

  });

  it( 'invitation should create a contributor from user id', function( done ) {

    svc.processInvitation( { invitationId: invitations[ 0 ].id }, function( err ) {

      agendas[ 0 ].isContributor( { id: users[ 0 ].id }, function( err, is ) {

        is.should.equal( true );

        cbm.lib.query( 'select id from invitation where id = ?', [ invitations[ 0 ].id ], function( err, rows ) {

          rows.length.should.equal( 0 );

          done();

        } );

      });

    } );

  } );


  it( 'invitation should create a contributor from user email', function( done ) {

    svc.processInvitation( { invitationId: invitations[ 1 ].id }, function( err ) {

      agendas[ 1 ].isContributor( { id: users[ 0 ].id }, function( err, is ) {

        is.should.equal( true );

        cbm.lib.query( 'select id from invitation where id = ?', [ invitations[ 1 ].id ], function( err, rows ) {

          rows.length.should.equal( 0 );

          done();

        } );

      });

    } );

  } );


  it( 'contributor invitation should trigger a mail send', function( done ) {

    svc.processInvitation( { invitationId: invitations[ 2 ].id }, function( err ) {

      cbm.lib.query( 'select * from invitation where id = ?', [ invitations[ 2 ].id ], function( err, rows ) {

        rows.length.should.equal( 1 );

        coms.consume( 'mailer', true, function( err, mail ) {

          mail.recipient.should.equal( 'random@oa.com' );
          mail.subject.should.equal( 'Vous avez été invité à devenir contributeur de l\'agenda Fete de la bretagne' );
          mail.text.indexOf().should.not.equal( 'Cliquez ici pour commencer à contribuer à l\'agenda Fete de la bretagne' );

          done();

        });

      } );

    });

  });
  

  it( 'invitation should create an administrator from user id', function( done ) {

    svc.processInvitation( { invitationId: invitations[ 3 ].id }, function( err ) {

      agendas[ 0 ].isAdministrator( { id: users[ 3 ].id }, function( err, is ) {

        is.should.equal( true );

        cbm.lib.query( 'select id from invitation where id = ?', [ invitations[ 3 ].id ], function( err, rows ) {

          rows.length.should.equal( 0 );

          done();

        } );

      });

    } );

  } );


  it( 'invitation should create an administrator from user email', function( done ) {

    svc.processInvitation( { invitationId: invitations[ 4 ].id }, function( err ) {

      agendas[ 1 ].isAdministrator( { id: users[ 3 ].id }, function( err, is ) {

        is.should.equal( true );

        cbm.lib.query( 'select id from invitation where id = ?', [ invitations[ 4 ].id ], function( err, rows ) {

          rows.length.should.equal( 0 );

          done();

        } );

      });

    } );

  } );


  it( 'administrator invitation should trigger a mail send', function( done ) {

    svc.processInvitation( { invitationId: invitations[ 5 ].id }, function( err ) {

      cbm.lib.query( 'select id from invitation where id = ?', [ invitations[ 5 ].id ], function( err, rows ) {

        rows.length.should.equal( 1 );

        coms.consume( 'mailer', true, function( err, mail ) {

          mail.recipient.should.equal( 'otherrandom@oa.com' );

          mail.subject.should.equal( 'Vous avez été invité à devenir administrateur de l\'agenda Fete de la bretagne' );

          mail.text.indexOf( 'Cliquez ici pour commencer à administrer l\'agenda Fete de la bretagne' ).should.not.equal( -1 );

          done();

        });

      } );

    });


  });


  it( 'process user invitations', function( done ) {

    svc.processUser( { user: users[ 0 ], iToken: 789 }, function( err, result ) {

      cbm.lib.query( 'select * from reviewer where user_id = ?', [ users[ 0 ].id ], function( err, rows ) {

        rows.length.should.equal( 3 );

        var agendaIds = agendas.map( function( a ) { return a.id; } );

        rows.forEach( function( row ) {

          agendaIds.indexOf( row.review_id ).should.not.equal( -1 );

        });

        done();

      });


    } );

  });

} );
