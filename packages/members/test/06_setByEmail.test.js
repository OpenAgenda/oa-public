'use strict';

const Service = require('../');
const config = require('../testconfig');
const fixtures = require('./fixtures');
const queues = require('./mock/queues');
const getUsersByUid = require('./fixtures/getUsersByUid');
const getEventCountByUserUid = require('./fixtures/getEventCountByUserUid');

describe('members - functional - setByEmail', () => {
  const f = fixtures(config.mysql);

  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getUsersByUid,
        getEventCountByUserUid,
        onRemove: () => {}
      },
      queues,
      bulkThreshold: 1
    });
  });

  afterAll(f.destroyClient);

  describe('setByEmail', () => {
    describe('set creates', () => {
      let result;
      let member;

      beforeAll(async () => {
        member = await svc.get.byEmail({
          email: 'kevin@oa.com',
          agendaUid: 1
        });
      });

      beforeAll(async () => {
        result = await svc.set.byEmail(
          {
            agendaUid: 1,
            email: 'kevin@oa.com',
            role: 2
          },
          { requireCustom: false }
        );
      });

      test('member was not existing before set', async () => {
        expect(member).toBeNull();
      });

      test('created member is not associated to any user', async () => {
        expect(result.member.userUid).toBeNull();
      });
    });

    describe('set promotes', () => {
      let result;
      let member;

      beforeAll(async () => {
        member = await svc.get.byEmail({
          agendaUid: 1,
          email: 'jc@ponceau.fr'
        });
      });

      beforeAll(async () => {
        result = await svc.set.byEmail(
          {
            agendaUid: 1,
            email: 'jc@ponceau.fr',
            role: 2
          },
          { requireCustom: false }
        );
      });

      test('member was not admin before set', async () => {
        expect(member.role).toBe(1);
      });

      test('member is admin after set', async () => {
        expect(result.member.role).toBe(2);
      });
    });

    describe('bulk', () => {
      const queueCalls = [];
      let result;

      beforeAll(async () => {
        queues.mockOn('register', methods => {
          queueCalls.push({ call: 'register', methods });
        });

        queues.mockOn('queue', (...args) => {
          queueCalls.push({ call: 'queue', args });
        });

        svc.task();

        result = await svc.set.byEmail.bulk(
          {
            agendaUid: 123,
            role: 1
          },
          ['albert@oa.com', 'alice@oa.com'],
          {
            requireCustom: false
          }
        );
      });

      test('service task registers setByEmail method', () => {
        expect(queueCalls[0].call).toBe('register');
        expect(Object.keys(queueCalls[0].methods)[0]).toBe('setByEmail');
      });

      test('if bulk items are above threshold, they are queued', () => {
        expect(queueCalls.filter(c => c.call === 'queue')).toHaveLength(2);
      });

      test('result provides queued count', () => {
        expect(result.queued).toBe(2);
      });

      test('queued arguments are prepared to be given as is to set method', () => {
        expect(queueCalls.filter(c => c.call === 'queue')[0]).toEqual({
          call: 'queue',
          args: [
            'setByEmail',
            { agendaUid: 123, role: 1, email: 'albert@oa.com' },
            { requireCustom: false }
          ]
        });
      });

      test('if bulk items are below threshold, they are processed directly', async () => {
        const bulkResult = await svc.set.byEmail.bulk(
          {
            agendaUid: 123,
            role: 1
          },
          ['bernard@oa.com'],
          {
            requireCustom: false
          }
        );

        expect(bulkResult.queued).toBe(0);

        expect(bulkResult.processed).toHaveLength(1);

        expect(Object.keys(bulkResult.processed[0])).toEqual([
          'errors',
          'success',
          'member',
          'operation'
        ]);
      });
    });
  });
});
