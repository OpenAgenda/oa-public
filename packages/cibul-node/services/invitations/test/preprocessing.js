"use strict";

process.env.NODE_ENV = 'test';

// load libs

var should = require( 'should' ),

async = require( 'async' ),

config = require( ';./../../config' ),

cbm = require( 'cibulModel' )( config.db ),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( cbm ),

sets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

svc = require( '../invitations' );

describe( 'invitation preprocessing', function() {

  var agenda = {}, user = {}, invitation;

  // create an agenda
  before( sets.prepareOneAgendaInstance( agenda, 'la-gargouille' ) );

  // create a user to invite (not activated)
  before( function( done ) {

    fixtures.load( 'users', 'freddy', { isActivated: false }, function( err, u ) {

      user = u;

      done();

    });

  } );

  // create an invitation from said agenda
  before( function( done ) {

    cbm.lib.insert( 'invitations', { type: 1, userId: user.id, token: 888, reviewId: agenda.id }, function( err, i ) {

      invitation = i;

      done();

    } );

  });

  // check that user is not activated on preprocess of uncred agenda
  it( 'uncreded preprocess', function( done ) {

    svc.preprocessUser( { user: user }, function( err ) {

      cbm.users().get( { id: user.id }, function( err, updatedUser ) {

        updatedUser.isActivated.should.be.nok;

        done();

      });

    });

  } );

  // cred agenda and check that user is activated on preprocess
  it( 'creded preprocess', function( done ) {

    agenda.setCredential( 'activatingInvitations', function( err ) {

      svc.preprocessUser( { user: user }, function( err ) {

        cbm.users().get( { id: user.id }, function( err, updatedUser ) {

          updatedUser.isActivated.should.be.ok;

          done();

        } );

      });

    });

  });

} );