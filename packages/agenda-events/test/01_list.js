"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const should = require( 'should' );

describe( 'agendaEvents - functional (server): list', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  it( 'simple list', async () => {

    let result = await svc( 62792452 ).list( 100, 10 );

    Object.keys( result ).should.eql( [ 'items', 'total' ] );

  } );

  it( 'total gives an integer equal to the total number of items', async () => {

    let result = await svc( 62792452 ).list( 100, 10 );

    result.total.should.equal( 2288 );

  } );

  it( 'an item contains agenda & event references, state, featured bool and custom data', async () => {

    let result = await svc( 62792452 ).list( 0, 1 );

    Object.keys( result.items[ 0 ] ).should.eql([ 
      'eventUid',
      'agendaUid',
      'featured',
      'state',
      'legacyId',
      'createdAt',
      'updatedAt'
    ] );

  } );

} );