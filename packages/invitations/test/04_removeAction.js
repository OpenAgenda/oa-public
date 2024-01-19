"use strict";

const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'invitations - functional (server): remove an action from an invitation', function () {

  this.timeout( 20000 );

  before( 'init and load', done => {

    service.initAndLoad( config, done );

  } );

  it( 'remove an action from an invitation that not exists', done => {

    service.removeAction( { email: 'kevin.bertho@not-found.com' }, 1 )
      .then( result => {

        should( result.success ).equal( false );
        should( result.errors.length ).equal( 1 );
        should( result.errors[ 0 ].code ).equal( 'invitation.notFound' );

        done();

      } )
      .catch( done );

  } );

  it( 'remove an action from an invitation', done => {

    service.removeAction( { email: 'kevin.bertho@gmail.com' }, 1 )
      .then( result => {

        should( result.success ).equal( true );
        should( result.errors.length ).equal( 0 );
        should( result.invitation.data ).eql( {
          nextId: 3,
          actions: [ { id: 2, name: 'uneActionBidon', params: [ 'firstParams', { second: 'caca' } ] } ]
        } );

        done();

      } )
      .catch( done );

  } );

} );
