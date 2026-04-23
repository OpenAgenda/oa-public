import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('agendaEvents - functional (server): utils', () => {
  let knex;
  let svc;

  beforeAll(async () => {
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
