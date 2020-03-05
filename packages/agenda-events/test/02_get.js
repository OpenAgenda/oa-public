'use strict';

const _ = require('lodash');
const should = require('should');

const Service = require('../');
const config = require('../testconfig');

const fixtures = require('./fixtures');
const membersFixtures = require('./fixtures/membersFixtures.json');

describe('agendaEvents - 02 - functional (server): get', function() {
  let svc, get;

  before(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      'agenda_event.create.sql',
      'agenda_event.data.sql'
    ]);
  });

  before(() => {
    svc = Service({
      ...config,
      interfaces: {
        ...config.interfaces,
        getMembers: async aes => aes.map(ae => _.find(
          membersFixtures, {
            agendaUid: ae.agendaUid,
            userUid: ae.userUid
          }
        ))
      }
    });

    get = svc.get;
  });

  it('simple get', async () => {
    const ref = await svc(62792452).get(10974548);

    _.omit(ref, ['updatedAt', 'createdAt']).should.eql({
      agendaUid: 62792452,
      eventUid: 10974548,
      userUid: 12312312,
      aggregated: false,
      sourcePaths: [],
      state: config.eventStates.VALIDATED,
      featured: false,
      canEdit: false,
      legacyId: '42.24'
    });
  });

  it('get with decorate to get member details', async () => {
    const ref = await svc(62792452).get(10974548, {
      decorate: ['member']
    });

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

  it('get provides empty sourcePaths list when none are stored in entry', async () => {
    const ae = await svc(62792452).get(53117383);

    ae.sourcePaths.should.eql([]);
  });

  it('get provides sourcePaths as list of uids (or list of list) when a json is stored in entry', async () => {
    const ae = await svc(62792452).get(60059313);

    ae.sourcePaths.should.eql([11, [22], 33]);
  });


  it( 'get by legacy id', async () => {
    let ref = await get.byLegacyId(42, 24);

    _.omit(ref, ['updatedAt', 'createdAt']).should.eql( {
      eventUid: 10974548,
      agendaUid: 62792452,
      userUid: 12312312,
      aggregated: false,
      sourcePaths: [],
      featured: false,
      canEdit: false,
      state: config.eventStates.VALIDATED,
      legacyId: '42.24'
    } );
  } );

} );
