import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import Files from '@openagenda/files';
import Agendas from '../service/index.js';
import testConfig from '../testconfig.js';
import setup from './fixtures/setup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = 'test';
const { service: config, dependencies: dConfig } = testConfig;

describe('agendas - functional (server): middleware', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [
        `${__dirname}/fixtures/agenda.data.sql`,
        `${__dirname}/fixtures/agendaEvent.data.sql`,
      ],
    });
    svc = Agendas({
      ...config,
      knex,
      Files: Files(dConfig.files),
    });
  });

  afterAll(() => knex?.destroy());

  describe('.load', () => {
    it('.load loads agenda data in req', () => {
      const req = {
        agendaSlug: 'epn-espace-torcy',
      };

      const res = {};

      return new Promise((resolve, reject) => {
        function next(err) {
          if (err) return reject(err);

          expect(req.agenda.title).toBe('EPN "Espace Torcy"');

          resolve();
        }

        svc.middleware.load()(req, res, next);
      });
    });

    it('.load namespaces can be specified', () => {
      const req = {
        uid: 94345899,
      };

      const res = {};

      return new Promise((resolve, reject) => {
        function next(err) {
          if (err) return reject(err);

          expect(req.a.title).toBe('EPN "Espace Torcy"');

          resolve();
        }

        svc.middleware.load({
          namespaces: { identifiers: { uid: 'uid' }, result: 'a' },
        })(req, res, next);
      });
    });

    it('.load with instanciate returns an instance of Agenda', () => {
      const req = {
        uid: 94345899,
      };

      const res = {};

      return new Promise((resolve, reject) => {
        function next(err) {
          if (err) return reject(err);

          expect(req.a).toBeInstanceOf(svc.Agenda);

          resolve();
        }

        svc.middleware.load({
          namespaces: {
            identifiers: { uid: 'uid' },
            result: 'a',
          },
          instanciate: true,
        })(req, res, next);
      });
    });
  });
});
