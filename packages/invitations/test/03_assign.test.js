"use strict";

const service = require( './service' );
const config = require( '../testconfig' );

const actions = {
  setToEnglish: cb => cb( true )
};

describe( 'invitations - functional (server): assign an action to an invitation', () => {

  beforeAll(done => {

    service.initAndLoad( Object.assign( {}, config, { actions } ), done );

  });

  it('assigning an action to an inexistent invitation creates it', done => {

    service.assign( { email: 'kevin.bertho@openagenda.com' }, 'setToEnglish' )
      .then( result => {

        expect(result.success).toBe(true);
        expect(result.errors.length).toBe(0);
        expect(result.invitation.data).toStrictEqual({
          nextId: 1,
          actions: [ { id: 1, name: 'setToEnglish', params: [] } ]
        });

        done();

      } )
      .catch( done );

  });

  it('works with callback too', done => {

    service.assign( { email: 'kevin@bertho.com' }, 'setToEnglish', ( err, result ) => {
      expect( err ).toBeNull();
      expect( result.success ).toBe( true );
      expect( result.errors.length ).toBe( 0 );
      expect( result.invitation.data ).toStrictEqual( {
        nextId: 1,
        actions: [{ id: 1, name: 'setToEnglish', params: [] }]
      })
      done();

    } );

  });

  it('assigning an action to an invitation with params', done => {

    service.assign( { email: 'kaore.olafsson@gmail.com' }, 'setToEnglish', [ [ 'an', 'array', 'first' ], 42 ] )
      .then( result => {

        expect( result.success ).toBe( true );
        expect( result.errors.length ).toBe( 0 );
        expect( result.invitation.data ).toStrictEqual({
          nextId: 1,
          actions: [{ id: 1, name: 'setToEnglish', params: [['an', 'array', 'first'], 42] }]
        });
        done();

      } )
      .catch( done );

  });

  it(
    'cannot assign an action to an inexistent invitation without specifing email',
    done => {

      service.assign( { token: 'mabite' }, 'setToEnglish' )
        .then( ( result ) => {

          expect(result.success).toBe(false);
          expect(result.errors.length).toBe(1);
          expect(result.errors[0].code).toBe('invitation.notFound');

          done();

        } )
        .catch( done );

    }
  );

  it('cannot assign an action that not exists', done => {

    service.assign( { email: 'kevin.bertho@gmail.com' }, 'notExists' )
      .then( result => {

        expect(result.success).toBe(false);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].code).toBe('action.notFound');

        done();

      } )
      .catch( done );

  });

  it('onAssign receive Invitation instance and action', done => {

    const conf = Object.assign( {}, config, { actions } );
    conf.interfaces.onAssign = (action, Invitation, cb) => {
      expect(action).toStrictEqual({ id: 1, name: 'setToEnglish', params: [ [ 'an', 'array', 'first' ], 42 ] });
      cb();

    };

    service.initAndLoad( conf, err => {

      expect(err).toBeUndefined();

      service.assign( { email: 'kaore.olafsson@gmail.com' }, 'setToEnglish', [ [ 'an', 'array', 'first' ], 42 ] )
        .then( result => {
          expect(result.success).toBe(true);  
          expect(result.errors.length).toBe(0);
          done();

        } )
        .catch( done );

    } );

  });

} );
