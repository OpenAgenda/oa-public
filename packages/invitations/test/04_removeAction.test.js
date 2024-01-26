"use strict";

const service = require( './service' );
const config = require( '../testconfig' );

describe( 'invitations - functional (server): remove an action from an invitation', () => {


  beforeAll(done => {

    service.initAndLoad( config, done );

  });

  it('remove an action from an invitation that not exists', done => {

    service.removeAction( { email: 'kevin.bertho@not-found.com' }, 1 )
      .then( result => {

        expect(result.success).toBe(false);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].code).toBe('invitation.notFound');

        done();

      } )
      .catch( done );

  });

  it('remove an action from an invitation', done => {

    service.removeAction( { email: 'kevin.bertho@gmail.com' }, 1 )
      .then( result => {

        expect( result.success ).toBe( true );
        expect( result.errors.length ).toBe( 0 );
        expect( result.invitation.data ).toStrictEqual( {
          nextId: 3,
          actions: [{ id: 2, name: 'uneActionBidon', params: ['firstParams', { second: 'caca' }] }]
        })
        done();

      } )
      .catch( done );

  });

} );
