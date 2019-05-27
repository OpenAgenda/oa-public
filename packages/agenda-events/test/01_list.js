"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );
const config = require( '../testconfig' );
const should = require( 'should' );
const states = require( '../iso/states' );

describe( 'agendaEvents - functional (server): list', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  it( 'simple list', async () => {

    const result = await svc( 62792452 ).list( 100, 10 );

    Object.keys( result ).should.eql( [ 'items', 'total' ] );

  } );

  it( 'list filtered by state using code in query', async () => {

    const result = await svc( 62792452 ).list( {
      state: states.PUBLISHED
    }, 0, 10 );

    result.total.should.equal( 1 );

  } );

  it( 'list filtered by state using string in query', async () => {

    const result = await svc( 62792452 ).list( {
      state: 'published'
    }, 0, 10 );

    result.total.should.equal( 1 );

  } );

  it( 'total gives an integer equal to the total number of items', async () => {

    const result = await svc( 62792452 ).list( 100, 10 );

    result.total.should.equal( 2288 );

  } );

  it( 'listByLastId for faster list', async () => {

    const result = await svc( 62792452 ).listByLastId( 0, 10 );

    result.items.length.should.equal( 10 );

    const lastId = result.lastId;

    const next = await svc( 62792452 ).listByLastId( lastId, 10 );

    lastId.should.equal( 437234 );

    next.lastId.should.equal( 437415 );

  } );

  it( 'an item contains agenda & event references, state, featured bool and custom data', async () => {

    const result = await svc( 62792452 ).list( 0, 1 );

    Object.keys( result.items[ 0 ] ).should.eql([
      'eventUid',
      'agendaUid',
      'userUid',
      'featured',
      'canEdit',
      'state',
      'legacyId',
      'createdAt',
      'updatedAt'
    ] );

  } );

} );
