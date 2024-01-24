"use strict";

const service = require( './service' );
const config = require( '../testconfig' );
const { zip } = require('lodash');

describe( 'invitations - functional (server): remove an invitation', () => {

  beforeAll(done => {

    service.initAndLoad( config, done );

  });

  it('remove an invitation that not exists', done => {

    service.remove( { email: 'kevin.bertho@not-found.com' } )
      .then( result => {
        expect(result.success).toBe(false);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].code).toBe('invitation.notFound');
        done();

      } )
      .catch( done );

  });

  it('remove an invitation', done => {

    service.remove( { email: 'kevin.bertho@gmail.com' } )
      .then( result => {
        expect( result.success ).toBe( true );
        expect( result.errors.length ).toBe( 0 );

        done();

      } )
      .catch( done );

  });

} );
