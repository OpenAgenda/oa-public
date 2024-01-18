"use strict";

const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'invitations - functional (server): remove an invitation', function () {

  this.timeout( 20000 );

  before( 'init and load', done => {

    service.initAndLoad( config, done );

  } );

  it( 'remove an invitation that not exists', done => {

    service.remove( { email: 'kevin.bertho@not-found.com' } )
      .then( result => {

        should( result.success ).equal( false );
        should( result.errors.length ).equal( 1 );
        should( result.errors[ 0 ].code ).equal( 'invitation.notFound' );

        done();

      } )
      .catch( done );

  } );

  it( 'remove an invitation', done => {

    service.remove( { email: 'kevin.bertho@gmail.com' } )
      .then( result => {

        should( result.success ).equal( true );
        should( result.errors.length ).equal( 0 );

        done();

      } )
      .catch( done );

  } );

} );
