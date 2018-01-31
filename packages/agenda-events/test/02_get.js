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