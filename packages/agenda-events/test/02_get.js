"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const get = require( '../service/get' );

const config = require( '../testconfig' );

const _ = require( 'lodash' );

const should = require( 'should' );

describe( 'agendaEvents - functional (server): get', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  it( 'simple get', async () => {

    let ref = await svc( 62792452 ).get( 10974548 );

    _.omit( ref, [ 'updatedAt', 'createdAt' ] ).should.eql( {
      agendaUid: 62792452,
      eventUid: 10974548,
      userUid: 12312312,
      state: config.eventStates.VALIDATED,
      featured: false,
      canEdit: false,
      legacyId: '42.24'
    } );

  } );

  it('explicit error is thrown when event uid is not provided', async () => {
    let error;
    try {
      await svc(62792452).get();
    } catch (e) {
      error = e;
    }
    error.message.should.equal('Event uid is missing');
  });

  it('explicit error is thrown when agenda uid is not provided', async () => {
    let error;
    try {
      await svc().get(10974548);
    } catch (e) {
      error = e;
    }
    error.message.should.equal('Agenda uid is missing');
  });


  it( 'get by legacy id', async () => {

    let ref = await get.byLegacyId( 42, 24 );

    _.omit( ref, [ 'updatedAt', 'createdAt' ] ).should.eql( {
      eventUid: 10974548,
      agendaUid: 62792452,
      userUid: 12312312,
      featured: false,
      canEdit: false,
      state: config.eventStates.VALIDATED,
      legacyId: '42.24'
    } );


  } );

} );
