import config from '../testconfig.js';
import Service from '../index.js';
import fixtures from './fixtures/index.js';
import queues from './mock/queues.js';
import getUsersByUid from './fixtures/getUsersByUid.js';
import getEventCountByUserUid from './fixtures/getEventCountByUserUid.js';
import getUserByEmail from './fixtures/getUserByEmail.js';

describe('members - functional - setByEmail', () => {
  const f = fixtures(config.mysql);

  let svc;
  const queueCalls = [];

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getUsersByUid,
        getEventCountByUserUid,
        getUserByEmail,
        onRemove: () => {},
      },
      queues,
      queue: {
        add: (name, data) => {
          queueCalls.push({ name, data });
        },
      },
      createWorker: () => ({
        run: () => {},
        on: () => {},
      }),
      bulkThreshold: 1,
    });
  });

  afterAll(f.destroyClient);

  describe('setByEmail', () => {
    describe('creates', () => {
      let result;
      let member;

      beforeAll(async () => {
        member = await svc.get.byEmail({
          email: 'kevin@oa.com',
          agendaUid: 1,
        });
      });

      beforeAll(async () => {
        result = await svc.set.byEmail(
          {
            agendaUid: 1,
            email: 'kevin@oa.com',
            role: 2,
          },
          { requireCustom: false },
        );
      });

      test('member was not existing before set', async () => {
        expect(member).toBeNull();
      });

      test('created member is not associated to any user', async () => {
        expect(result.member.userUid).toBeNull();
      });
    });

    describe('promotes', () => {
      let result;
      let member;

      beforeAll(async () => {
        member = await svc.get.byEmail({
          agendaUid: 1,
          email: 'jc@ponceau.fr',
        });
      });

      beforeAll(async () => {
        result = await svc.set.byEmail(
          {
            agendaUid: 1,
            email: 'jc@ponceau.fr',
            role: 2,
          },
          { requireCustom: false },
        );
      });

      test('member was not admin before set', async () => {
        expect(member.role).toBe(1);
      });

      test('member is admin after set', async () => {
        expect(result.member.role).toBe(2);
      });
    });

    describe('looks into getUserUidByEmail when email is not found in store', () => {
      let result;

      beforeAll(async () => {
        result = await svc.set.byEmail({
          email: 'truc@delinterface.fr',
          agendaUid: 1,
          role: 2,
        });
      });

      test('operation is patch', () => {
        expect(result.operation).toBe('patch');
      });

      test('role is updated', () => {
        expect(result.member.role).toBe(2);
      });
    });

    describe('bulk', () => {
      let result;

      beforeAll(async () => {
        svc.task();

        result = await svc.set.byEmail.bulk(
          {
            agendaUid: 123,
            role: 1,
          },
          ['albert@oa.com', 'alice@oa.com'],
          {
            requireCustom: false,
          },
        );
      });

      test('if bulk items are above threshold, they are queued', () => {
        expect(queueCalls).toHaveLength(2);
      });

      test('result provides queued count', () => {
        expect(result.queued).toBe(2);
      });

      test('queued arguments are prepared to be given as is to set method', () => {
        expect(queueCalls).toEqual([
          {
            data: {
              data: { agendaUid: 123, email: 'albert@oa.com', role: 1 },
              options: { requireCustom: false },
            },
            name: 'setByEmail',
          },
          {
            data: {
              data: { agendaUid: 123, email: 'alice@oa.com', role: 1 },
              options: { requireCustom: false },
            },
            name: 'setByEmail',
          },
        ]);
      });

      test('if bulk items are below threshold, they are processed directly', async () => {
        const bulkResult = await svc.set.byEmail.bulk(
          {
            agendaUid: 123,
            role: 1,
          },
          ['bernard@oa.com'],
          {
            requireCustom: false,
          },
        );

        expect(bulkResult.queued).toBe(0);

        expect(bulkResult.processed).toHaveLength(1);

        expect(Object.keys(bulkResult.processed[0])).toEqual([
          'errors',
          'success',
          'member',
          'operation',
        ]);
      });
    });
  });
});
