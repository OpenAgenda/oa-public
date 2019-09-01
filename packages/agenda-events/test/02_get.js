"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const should = require( 'should' );

const svc = require( './service' );
const get = require( '../service/get' );
const config = require( '../testconfig' );

const membersFixtures = require('./service/membersFixtures.json');

describe('agendaEvents - functional (server): get', function() {

  this.timeout( 5000 );

  before( done => {

    config.interfaces.getMembers = async aes => {
      return aes.map(ae => _.find(
        membersFixtures, {
          agendaUid: ae.agendaUid,
          userUid: ae.userUid
        }
      ));
    };

    svc.initAndLoad(config, done );
  } );

  it('simple get', async () => {
    const ref = await svc( 62792452 ).get( 10974548 );

    _.omit( ref, [ 'updatedAt', 'createdAt' ] ).should.eql( {
      agendaUid: 62792452,
      eventUid: 10974548,
      userUid: 12312312,
      state: config.eventStates.VALIDATED,
      featured: false,
      canEdit: false,
      legacyId: '42.24'
    } );
  });

  it('get with decorate to get member details', async () => {
    const ref = await svc(62792452).get(10974548, { decorate: ['member'] });

    ref.member.should.eql({ agendaUid: 62792452, userUid: 12312312, role: 1 });
  });

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
