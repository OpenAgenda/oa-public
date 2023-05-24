'use strict';

const _ = require('lodash');
const assert = require('assert');
const redis = require('redis');
const Queues = require('@openagenda/queues');

const Service = require('../');
const config = require('../testconfig');

const fixtures = require('./fixtures');
const membersFixtures = require('./fixtures/members.json');
const usersFixtures = require('./fixtures/users.json');
const sourceAgendasFixtures = require('./fixtures/sourceAgendas.json');

describe('agendaEvents - 02 - functional (server): get', function() {
  let svc, get;
  let redisClient;

  before(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql'
    ]);
  });

  before(async () => {
    redisClient = redis.createClient({
      socket: { host: 'localhost', port: 6379 }
    });

    await redisClient.connect();
  });

  before(() => {
    svc = Service({
      ...config,
      queue: Queues({
        redis: redisClient,
        prefix: 'agenda-events'
      })('02_get'),
      interfaces: {
        ...config.interfaces,
        getMembers: async aes => aes.map(ae => _.find(membersFixtures, {
          agendaUid: ae.agendaUid,
          userUid: ae.userUid
        })),
        getUsers: async aes => ([]
          .concat(aes)
          .map(ae => usersFixtures.find(u => u.uid === ae.userUid))
        ),
        getSourceAgendas: async sourceAgendaUids => sourceAgendasFixtures
          .filter(agenda => sourceAgendaUids.includes(agenda.uid))
      }
    });

    get = svc.get;
  });

  after(async () => redisClient.quit());

  describe('simple get', () => {
    let ref;

    before(async () => {
      ref = await svc(62792452).get(10974548)
    });

    it('agendaUid, eventUid, userUid are provided', () => {
      assert.equal(ref.agendaUid, 62792452);
      assert.equal(ref.eventUid, 10974548);
      assert.equal(ref.userUid, 12312312);
    });

    it('if aggregated, sourcePaths are provided and aggregated bool is true', () => {
      assert.deepEqual(ref.sourcePaths, [[6789678], [896785]]);
      assert(ref.aggregated);
    });

    it('canEdit bool indicates if agenda has edit rights on event', () => {
      assert.equal(ref.canEdit, false);
    });

    it('state in agenda is provided', () => {
      assert.equal(ref.state, config.eventStates.VALIDATED);
    });

    it('featured bool is provided', () => {
      assert.equal(ref.featured, false);
    });

    it('legacyId is provided and is composed of legacy agenda id and event id', () => {
      assert.equal(ref.legacyId, '42.24');
    });
  });

  it('get with decorate to get member details', async () => {
    const ref = await svc(62792452).get(10974548, {
      decorate: ['member']
    });

    assert.deepEqual(
      ref.member,
      {
        agendaUid: 62792452,
        userUid: 12312312,
        role: 1
      }
    );
  });

  it('get with decorate to get user details', async () => {
    const ref = await svc(62792452).get(10974548, {
      decorate: ['user']
    });

    assert.deepEqual(
      ref.user,
      {
        uid: 12312312,
        fullName: 'Kevin',
      }
    );
  });

  it('get with decorate to get sourceAgenda details', async () => {
    const ref = await svc(62792452).get(10974548, {
      decorate: ['sourceAgendas']
    });

    assert.deepEqual(
      ref.sourceAgendas,
      [{
        uid: 6789678,
        title: 'La source'
      }, {
        uid: 896785,
        title: 'Et encore une source'
      }]
    );
  });

  it('explicit error is thrown when event uid is not provided', async () => {
    let error;
    try {
      await svc(62792452).get();
    } catch (e) {
      error = e;
    }
    assert.equal(error.message, 'Event uid is missing');
  });

  it('explicit error is thrown when agenda uid is not provided', async () => {
    let error;
    try {
      await svc().get(10974548);
    } catch (e) {
      error = e;
    }

    assert.equal(error.message, 'Agenda uid is missing');
  });

  it('get provides empty sourcePaths list when none are stored in entry', async () => {
    const ae = await svc(62792452).get(53117383);

    assert.deepEqual(ae.sourcePaths, []);
  });

  it('get provides sourcePaths as list of uids (or list of list) when a json is stored in entry', async () => {
    const ae = await svc(62792452).get(60059313);

    assert.deepEqual(ae.sourcePaths, [11, [22], 33]);
  });

  it('get by legacy id', async () => {
    const ref = await get.byLegacyId(42, 24);

    assert.deepEqual(
      _.omit(ref, ['updatedAt', 'createdAt']),
      {
        eventUid: 10974548,
        agendaUid: 62792452,
        userUid: 12312312,
        aggregated: 'achecksumvalue',
        sourcePaths: [[6789678], [896785]],
        featured: false,
        canEdit: false,
        state: config.eventStates.VALIDATED,
        legacyId: '42.24'
      }
    );  
  });

  it('get returns null if no match is found', async () => {
    assert.equal(
      await svc(62792452).get(60059377),
      null
    );
  });

  it('get throws not found error if option is set', async () => {
    let error;
    try {
      await svc(62792452).get(60059377, {
        throwOnNotFound: true
      });
    } catch (e) {
      error = e;
    }
    assert.equal(error.name, 'NotFoundError');
  });

} );
