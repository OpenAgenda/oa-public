"use strict";

const service = require( './service' );
const config = require( '../testconfig' );

describe( 'invitations - functional (server): initialization', () => {

  it(
    'if the service is not initialized, endpoints will throw an error',
    () => {

      return service.assign( { email: 'test@gmail.com', token: 'fqfdsqfsdsq' }, 'adminCreate', {} )
        .then( () => {

          throw new Error( 'Then is called but should not' );

        } )
        .catch( err => {

          expect(err).toEqual('service not initialized');

        } );

    }
  );

  it('initialize using .init()', done => {

    service.init( config, err => {
      expect(err).toEqual(undefined);
      done();

    } )

  });

  it('when testing use .initAndLoad to load fixtures at init', done => {

    service.initAndLoad( config, err => {

      expect(err).toEqual(undefined);
      done();

    } );

  });

  it('.initAndLoad can take the names of the fixture files to load', done => {

    service.initAndLoad( config, [
      'invitation'
    ], err => {

      expect(err).toEqual(undefined);
      done();

    } );

  });

} );
