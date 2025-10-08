import knex from 'knex';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('agendaEvents - functional (server): utils', () => {
  let svc;
  let knexClient;

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql',
    ]);
  });
  beforeAll(async () => {
    knexClient = knex({
      client: 'mysql2',
      connection: { ...config.mysql },
    });
  });

  beforeAll(() => {
    svc = Service({
      ...config,
      knex: knexClient,
    });
  });

  afterAll(() => knexClient.destroy());

  describe('setSourcePaths', () => {
    let result;

    beforeAll(async () => {
      result = await svc.utils.setSourcePaths(62792452, 16425580, [[123]]);
    });

    it('updated ref includes set source uid', () => {
      expect(result.updated.sourcePaths).toEqual([[123]]);
    });

    it('ref before did not include source uid', () => {
      expect(result.before.sourcePaths).toEqual([]);
    });
  });
});
