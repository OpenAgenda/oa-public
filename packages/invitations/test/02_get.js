"use strict";

const should = require( 'should' );
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

describe( 'invitations - functional (server): get an invitation', function () {

  this.timeout( 20000 );

  before( 'init and load', done => {

    service.initAndLoad( config, done );

  } );

  it( 'get with email', done => {

    service.get( { email: 'kevin.bertho@gmail.com' } )
      .then( ( { invitation } ) => {

        invitation._data.should.eql( invitationSample );
        should( invitation.id ).eql( invitationSample.id );
        should( invitation.email ).eql( invitationSample.email );
        should( invitation.token ).eql( invitationSample.token );
        should( invitation.data ).eql( invitationSample.store );

        done();

      } )
      .catch( done );

  } );

  it( 'get with token', done => {

    service.get( { token: '066LREi0S3hUA2Uh273a6b147C15rMV2' } )
      .then( ( { invitation } ) => {

        invitation._data.should.eql( invitationSample );
        should( invitation.id ).eql( invitationSample.id );
        should( invitation.email ).eql( invitationSample.email );
        should( invitation.token ).eql( invitationSample.token );
        should( invitation.data ).eql( invitationSample.store );

        done();

      } )
      .catch( done );

  } );

  it( 'get with bad token return null', done => {

    service.get( { token: '066LREi0S3hUA2Uh273a6b147C1mabite' } )
      .then( ( { invitation } ) => {

        should( invitation ).equal( null );

        done();

      } )
      .catch( done );

  } );

} );
