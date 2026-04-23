import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import _ from 'lodash';
import ih from 'immutability-helper';
import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('agendaEvents - 05 - functional (server): remove', () => {
  let knex;
  let svc;

  beforeEach(async () => {
    if (knex) {
      await knex.destroy().catch(() => {});
    }
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/agenda_event.data.sql`],
    });

    svc = Service({
      ...config,
      knex,
    });
  });

  afterAll(() => knex?.destroy());

  it('simple remove', async () => {
    const before = await svc(62792452).get(10974548);
    const result = await svc(62792452).remove(10974548);
    const after = await svc(62792452).get(10974548, { removed: null });

    expect(result.success).toBe(true);

    expect(before).not.toBeNull();

    expect(after.removed).toBeTruthy();

    expect(_.pick(result.removed, ['eventUid', 'agendaUid'])).toEqual({
      eventUid: 10974548,
      agendaUid: 62792452,
    });
  });

  it('all references of given event can be removed in one call', async () => {
    const result = await svc.remove(15205357);

    expect(result).toEqual({
      success: true,
      removed: 2,
    });
  });

  it('when several references are removed', () =>
    new Promise((rs) => {
      let count = 0;

      const svc2 = Service({
        ...config,
        interfaces: {
          onRemove: (removed) => {
            count += 1;

            expect(removed.eventUid).toEqual(15205357);

            if (count === 2) {
              rs();
            }
          },
        },
      });

      svc2.remove(15205357);
    }));

  it('context can be passed in options to be transfered to onRemove interface', () =>
    new Promise((rs) => {
      const svc2 = Service(
        ih(config, {
          interfaces: {
            onRemove: {
              $set: (removed, context) => {
                expect(context.userUid).toEqual(111);

                rs();
              },
            },
          },
        }),
      );

      svc2(62792452).remove(10974548, {
        context: {
          userUid: 111,
        },
      });
    }));

  it('hard remove', async () => {
    const before = await svc(62792452).get(34285341);
    const result = await svc(62792452).remove(34285341, { soft: false });
    const after = await svc(62792452).get(34285341, { removed: null });

    expect(result.success).toBe(true);

    expect(before).not.toBeNull();

    expect(after).toBeNull();

    expect(_.pick(result.removed, ['eventUid', 'agendaUid'])).toEqual({
      eventUid: 34285341,
      agendaUid: 62792452,
    });
  });
});
