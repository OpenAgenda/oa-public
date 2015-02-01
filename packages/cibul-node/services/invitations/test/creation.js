"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../../../config' ),

cbm = require( 'cibulModel' )( config.db ),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( cbm ),

sets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

svc = require( '../invitations' ),

bogusComs = require( '../../../test/helpers/bogusComs' );

describe( 'invitation creation', function() {

  var agenda = {}, user = {};

  beforeEach( sets.prepareOneAgendaInstance( agenda, 'la-gargouille' ) );

  beforeEach( function( done ) {

    fixtures.load( 'users', 'freddy', function( err, result ) {

      user = result;

      done();

    } );

  } );

  it( 'successful creation of an invitation to contribute', function( done ) {

    svc.agenda( agenda ).inviteContributors( [ user.email ], 'fr', function( err, invitations, result ) {

      result.errors.length.should.equal( 0 );

      invitations.length.should.equal( 1 );

      invitations[ 0 ].email.should.equal( user.email );

      done();

    } );

  } );

  it( 'error on bad email', function( done ) {

    svc.agenda( agenda ).inviteContributors( [ 'fdqfdsq' ], 'fr', function( err, invitations, result ) {

      invitations.length.should.equal( 0 );

      result.errors.should.eql( [ { 
        email: 'fdqfdsq',
        errors: { email: 'the email is not valid' } 
      } ] );

      done();

    } );

  } );

  it( 'successful creation of an invitation creates a job for its processing', function( done ) {

    svc.setComs( bogusComs );

    svc.agenda( agenda ).inviteContributors( [ user.email, 'other@email.com' ], 'fr', function( err, invitations, result ) {

      bogusComs.consume( 'jobs', function( err, job ) {

        job.should.eql({
          type: 'invitations', 
          invitationId: invitations[ 0 ].id,
          lang: 'fr',
          action: 'processInvitation' 
        });

      });

      bogusComs.consume( 'jobs', function( err, jobs ) {

        jobs.invitationId.should.equal( invitations[ 1 ].id );

        done();

      });

    });

  });

} );