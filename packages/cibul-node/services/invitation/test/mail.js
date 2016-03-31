"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../../../config' ),

cbm = require( 'cibulModel' )( config.db ),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( cbm ),

sets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

svc = require( '../' ),

coms = require( '../../../lib/coms' );

describe( 'invitation mail inteface', function() {

  var agenda = {}, user = {};

  beforeEach( sets.prepareOneAgendaInstance( agenda, 'la-gargouille' ) );

  beforeEach( done => {

    fixtures.load( 'users', 'freddy', function( err, result ) {

      user = result;

      done();

    } );

  } );

  it( 'getMailIdentifier', done => {

    svc.agenda( agenda ).inviteContributors( { 
      emails: user.email,
      lang: 'fr',
      userId: agenda.ownerId
    }, function( err, invitations, result ) {

      let invitation = invitations[ 0 ];

      cbm.users().get( { id: agenda.ownerId }, ( err, user ) => {

        svc.mail.getMailIdentifier( invitation, ( err, identifier ) => {

          should( err ).equal( null );

          identifier.split( '@' )[ 0 ].should.equal( [
            invitation.token,
            user.uid,
            'invitation'
          ].join( '.' ) );

          done();

        } );

      } );

    } );

  } );

  it( 'loadUserFromMailIdentifier', done => {

    svc.agenda( agenda ).inviteContributors( { 
      emails: user.email,
      lang: 'fr',
      userId: agenda.ownerId
    }, ( err, invitations, result ) => {

      let invitation = invitations[ 0 ];

      svc.mail.getMailIdentifier( invitation, ( err, identifier ) => {

        svc.mail.loadUserFromMailIdentifier( identifier, ( err, user ) => {

          user.id.should.equal( agenda.ownerId );

          done();

        } );

      } );

    } );

  } );

} );