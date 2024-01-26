"use strict";

const service = require( './service' );
const config = require( '../testconfig' );
const _ = require( 'lodash' );

const invitationSample = {
  id: 1,
  email: 'kevin.bertho@gmail.com',
  token: '066LREi0S3hUA2Uh273a6b147C15rMV2',
  store: {
    nextId: 3,
    actions: [ {
      id: 1,
      name: 'createStakeholder',
      params: { role: 'admin' }
    }, {
      id: 2,
      name: 'uneActionBidon',
      params: [
        'firstParams',
        { second: 'caca' }
      ]
    } ]
  }
};

describe( 'invitations - functional (server): get an invitation', () => {

  beforeAll(done => {

    service.initAndLoad( config, done );

  });

  it('get with email', done => {

    service.get( { email: 'kevin.bertho@gmail.com' } )
      .then( ( { invitation } ) => {

        expect(invitation._data).toStrictEqual(invitationSample);
        expect(invitation.id).toBe(invitationSample.id);
        expect(invitation.email).toBe(invitationSample.email);
        expect(invitation.token).toBe(invitationSample.token); 
        expect(invitation.data).toStrictEqual(invitationSample.store);

        done();

      } )
      .catch( done );

  });

  it('get with token', done => {

    service.get( { token: '066LREi0S3hUA2Uh273a6b147C15rMV2' } )
      .then( ( { invitation } ) => {

        expect(invitation._data).toStrictEqual(invitationSample);
        expect(invitation.id).toBe(invitationSample.id);
        expect(invitation.email).toBe(invitationSample.email);
        expect(invitation.token).toBe(invitationSample.token);
        expect(invitation.data).toStrictEqual(invitationSample.store);

        done();

      } )
      .catch( done );

  });

  it('get with bad token return null', done => {

    service.get( { token: '066LREi0S3hUA2Uh273a6b147C1mabite' } )
      .then( ( { invitation } ) => {

        expect(invitation).toBeNull();
        done();

      } )
      .catch( done );

  });

} );
