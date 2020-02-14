"use strict";

const _ = require('lodash');

const svc = require( './service' );
const config = require( '../testconfig' );
const should = require( 'should' );
const states = require( '../iso/states' );

const membersFixtures = require('./service/membersFixtures.json');

describe( 'agendaEvents - functional (server): list', function() {

  this.timeout( 5000 );

  before( done => {

    config.interfaces.getMembers = async aes => {
      return aes.map(ae => _.find(
        membersFixtures, {
          agendaUid: ae.agendaUid,
          userUid: ae.userUid
        }
      )).filter(ae => !!ae);
    };

    svc.initAndLoad( config, done );

  } );

  it( 'simple list', async () => {

    const result = await svc( 62792452 ).list( 100, 10 );

    Object.keys( result ).should.eql( [ 'items', 'total' ] );

  } );

  it('list with member decorate provides members for each returned item', async () => {
    const { items } = await svc(62792452).list(100, 10, { decorate: ['member'] });

    items.filter(i => i.member).length.should.equal(4);

    items.filter(i => i.member)[0].member.should.eql({
      agendaUid: 62792452,
      userUid: 123,
      role: 2
    });
  });

  it( 'list filtered by state using code in query', async () => {

    const result = await svc( 62792452 ).list( {
      state: states.PUBLISHED
    }, 0, 10 );

    result.total.should.equal( 1 );

  } );

  it( 'query can be omitted', async () => {

    const result = await svc( 62792452 ).list( 0, 10 );

    result.items.length.should.equal(10);

  } );

  it( 'list filtered by state using string in query', async () => {

    const result = await svc( 62792452 ).list( {
      state: 'published'
    }, 0, 10 );

    result.total.should.equal( 1 );

  } );

  it('list filtered by aggregated boolean', async () => {
    const result = await svc(62792452).list({ aggregated: true }, 0, 0);

    result.total.should.equal(1);
  });

  it( 'total gives an integer equal to the total number of items', async () => {
    const result = await svc(62792452).list(100, 10);

    result.total.should.equal(2288);
  } );

  it( 'list for several event uids', async () => {

    const result = await svc( 62792452 ).list({
      eventUid: [ 54434612, 28028226 ]
    });

    result.items.length.should.equal(2);

  } );

  it( 'listByLastId for faster list', async () => {

    const result = await svc( 62792452 ).listByLastId( 0, 10 );

    result.items.length.should.equal( 10 );

    const lastId = result.lastId;

    const next = await svc( 62792452 ).listByLastId( lastId, 10 );

    lastId.should.equal( 437234 );

    next.lastId.should.equal( 437415 );

  } );

  it('list by event uid', async () => {
    const { items } = await svc.list.byEventUid(54434612, 0, 20);

    items.length.should.equal(1);
  });

  it('list by event uid and filtering out agenda uid from results', async () => {
    const { items } = await svc.list.byEventUid(54434612, { excludeAgendaUid: 62792452 }, 0, 1);

    items.length.should.equal(0);
  });

  it('an item contains agenda & event references, state, featured bool and custom data', async () => {

    const result = await svc(62792452).list(0, 1);

    Object.keys( result.items[ 0 ] ).should.eql([
      'eventUid',
      'agendaUid',
      'userUid',
      'aggregated',
      'sourceAgendaUid',
      'featured',
      'canEdit',
      'state',
      'legacyId',
      'createdAt',
      'updatedAt'
    ] );

  } );

} );
