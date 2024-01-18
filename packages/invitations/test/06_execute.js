"use strict";

const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'invitations - functional (server): execute actions of an invitation', function () {

  this.timeout( 20000 );

  before( 'init and load', done => {

    service.initAndLoad( Object.assign( config, {
      actions: {
        createStakeholder: ( executeData, actionParams, cb ) => cb( null, 'gugusse created' ),
        uneActionBidon: ( executeData, actionParams, cb ) => cb( null, 'bidon d\'huile' )
      }
    } ), done );

  } );

  it( 'execute actions of an invitation that not exists', done => {

    service.execute( { email: 'kevin.bertho@not-found.com' } )
      .then( result => {

        should( result.success ).equal( false );
        should( result.errors.length ).equal( 1 );
        should( result.errors[ 0 ].code ).equal( 'invitation.notFound' );

        done();

      } )
      .catch( done );

  } );

  it( 'execute actions of an invitation', done => {

    service.execute( { email: 'kevin.bertho@gmail.com' } )
      .then( result => {

        should( result.success ).equal( true );
        should( result.errors.length ).equal( 0 );
        should( result.results ).eql( [ 'gugusse created', 'bidon d\'huile' ] );

        done();

      } )
      .catch( done );

  } );

  it( 'execute missing actions of an invitation', done => {


    service.initAndLoad( Object.assign( config, {
      actions: {}
    } ), () => {

      service.execute( { email: 'kevin.bertho@gmail.com' } )
        .then( result => {

          should( result.success ).equal( false );
          should( result.errors.length ).equal( 2 );

          done();

        } )
        .catch( done );

    } );

  } );

} );
