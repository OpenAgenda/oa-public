"use strict";

const service = require( './service' );
const config = require( '../testconfig' );

describe( 'invitations - functional (server): execute actions of an invitation', () => {

  beforeAll(done => {

    service.initAndLoad( Object.assign( config, {
      actions: {
        createStakeholder: ( executeData, actionParams, cb ) => cb( null, 'gugusse created' ),
        uneActionBidon: ( executeData, actionParams, cb ) => cb( null, 'bidon d\'huile' )
      }
    } ), done );

  });

  it('execute actions of an invitation that not exists', done => {

    service.execute( { email: 'kevin.bertho@not-found.com' } )
      .then( result => {
        expect(result.success).toBe(false);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].code).toBe('invitation.notFound');
        done();

      } )
      .catch( done );

  });

  it('execute actions of an invitation', done => {

    service.execute( { email: 'kevin.bertho@gmail.com' } )
      .then( result => {

        expect(result.success).toBe(true); 
        expect(result.errors.length).toBe(0);
        expect(result.results).toStrictEqual(['gugusse created', 'bidon d\'huile']);

        done();

      } )
      .catch( done );

  });

  it('execute missing actions of an invitation', done => {


    service.initAndLoad( Object.assign( config, {
      actions: {}
    } ), () => {

      service.execute( { email: 'kevin.bertho@gmail.com' } )
        .then( result => {

          expect(result.success).toBe(false);
          expect(result.errors.length).toBe(2);

          done();

        } )
        .catch( done );

    } );

  });

} );
