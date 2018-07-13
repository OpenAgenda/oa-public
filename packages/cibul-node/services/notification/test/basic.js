"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../../../config' ),

cbm = require( 'cibulModel' )( config.db ),

fixtures = require( 'cibulModel/test/fixtures/fixtures' )( cbm ),

sets = require( 'cibulModel/test/fixtures/sets' )( cbm ),

notificationSvc = require( '../' ),

coms = require( '../../../lib/coms' );

describe( 'notification - basic', function() {

  var agenda = {}, user = {}, admins = [];

  before( function( done ) {

    coms.clearQueue( 'jobs', done );

  });

  // create an agenda
  before( sets.prepareOneAgendaInstance( agenda, 'la-gargouille' ) );

  // add an admin to agenda
  before( function( done ) {

    admins.push( agenda.ownerId );

    fixtures.load( 'users', 'cindy', function( err, u ) {

      admins.push( u.id );

      agenda.setAdministrator( u, done );

    });

  });

  // create a user to refer to
  before( function( done ) {

    fixtures.load( 'users', 'freddy', function( err, u ) {

      user = u;

      done();

    });

  } );

  it( 'notify.newContributor', function( done ) {

    notificationSvc.notify.newContributor( {
      agendaId: agenda.id,
      ownerId: user.id
    }, function( err ) {

      coms.consume( 'jobs', function( err, values ) {

        values.should.eql( {
          type: 'notification',
          action: 'process',
          values: {
            ownerId: user.id,
            reviewId: agenda.id,
            userId: false,
            type: cbm.notifications().TYPES.AGENDA.NEWCONTRIBUTOR
          } } );

        done();

      });

    } );

  });

  it( 'notify.expiredSwapcard', function( done ) {

    notificationSvc.notify.expiredSwapcard( {
      agendaId: agenda.id
    }, function( err ) {

      coms.consume( 'jobs', function( err, values ) {

        values.should.eql( {
          type: 'notification',
          action: 'process',
          values: {
            reviewId: agenda.id,
            userId: false,
            type: cbm.notifications().TYPES.AGENDA.EXPIREDSWAPCARD
          } } );

        done();

      });

    } );

  });

  it( 'process - newContributor', function( done ) {

    notificationSvc.process( { values: {
      reviewId: agenda.id,
      ownerId: user.id,
      userId: false,
      type: cbm.notifications().TYPES.AGENDA.NEWCONTRIBUTOR
    } }, function( err ) {

      cbm.notifications().list( function( err, rows ) {

        rows.length.should.equal( 2 );

        rows.forEach( function( row ) {

          row.type.should.equal( cbm.notifications().TYPES.AGENDA.NEWCONTRIBUTOR );

          admins.indexOf( row.userId ).should.not.equal( -1 );

          row.reviewId.should.equal( agenda.id );

        });

        done();

      });

    } )

  })

} );
