import { jest } from '@jest/globals';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'supertest';
import plugApp from '../services/agendas/apiKeysPlugApp.js';

// Lightweight mount of the keys plugApp with stubbed services, exercising the
// D3b-agenda routes (`…/admin/settings/api-keys`) in isolation: routing,
// guards, delegation to the auth façade, and response shapes. The façade itself
// (apikey-store reads/writes via the better-auth adapter) is integration-tested
// in @openagenda/auth (12_apiKey.test.js); here we only assert the HTTP wiring.

//   user           -> set on req before the routes, so the real `requireUser`
//                     guard (imported by plugApp) sees an authenticated request
//   auth           -> the façade mock (listAgendaKeys/createAgendaKey/revokeAgendaKey)
//   authorizeCalls -> records the role passed to members.mw.loadAndAuthorize at
//                     mount, to assert each route demands administrator
function buildApp({ user, auth, authorizeCalls } = {}) {
  const app = express();
  app.use(bodyParser.json());

  app.use((req, _res, next) => {
    if (user) req.user = user;
    next();
  });

  app.services = {
    agendas: {
      mw: {
        load: (req, _res, next) => {
          req.agenda = { uid: 2, slug: req.params.agendaSlug };
          next();
        },
      },
    },
    members: {
      mw: {
        loadAndAuthorize: (role) => {
          authorizeCalls?.push(role);
          return (req, _res, next) => next();
        },
      },
    },
    auth,
  };

  plugApp(app);

  app.use((err, req, res, _next) => {
    res.status(err.statusCode || 500).json({ message: err.message });
  });

  return app;
}

const ADMIN = { uid: 7 };

describe('90 - unit - agenda api-keys endpoints (D3b-agenda)', () => {
  describe('guards', () => {
    it('requireUserJson: 401s an anonymous request (JSON, not a redirect)', async () => {
      const app = buildApp({ auth: {} });
      const res = await request(app).get('/myagenda/admin/settings/api-keys');
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Not logged' });
    });

    it('declares administrator authorization on every api-key route', async () => {
      const authorizeCalls = [];
      buildApp({ authorizeCalls, auth: {} });
      // 4 routes (list/create/revoke/rename) each demand administrator;
      // a missing guard on a new route drops the count.
      const adminCount = authorizeCalls.filter(
        (r) => r === 'administrator',
      ).length;
      expect(adminCount).toBe(4);
    });
  });

  describe('list', () => {
    it('returns { items, total } from the façade, scoped to the agenda uid', async () => {
      const items = [
        { id: 'k1', name: 'a' },
        { id: 'k2', name: 'b' },
      ];
      const listAgendaKeys = jest.fn().mockResolvedValue(items);
      const app = buildApp({ user: ADMIN, auth: { listAgendaKeys } });

      const res = await request(app).get('/myagenda/admin/settings/api-keys');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ items, total: 2 });
      expect(listAgendaKeys).toHaveBeenCalledWith(2);
    });
  });

  describe('create', () => {
    it('201s with the plaintext shown once + the stored record', async () => {
      const created = {
        key: 'oa_plaintext_once',
        record: { id: 'k9', name: 'CI' },
      };
      const createAgendaKey = jest.fn().mockResolvedValue(created);
      const app = buildApp({ user: ADMIN, auth: { createAgendaKey } });

      const res = await request(app)
        .post('/myagenda/admin/settings/api-keys')
        .send({ name: 'CI' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(createAgendaKey).toHaveBeenCalledWith(2, { name: 'CI' });
    });

    it('accepts legacy `label` as the name alias', async () => {
      const createAgendaKey = jest
        .fn()
        .mockResolvedValue({ key: 'x', record: {} });
      const app = buildApp({ user: ADMIN, auth: { createAgendaKey } });

      await request(app)
        .post('/myagenda/admin/settings/api-keys')
        .send({ label: 'Legacy label' });

      expect(createAgendaKey).toHaveBeenCalledWith(2, { name: 'Legacy label' });
    });
  });

  describe('revoke', () => {
    it('200s { removed: true } when the façade removed a row', async () => {
      const revokeAgendaKey = jest.fn().mockResolvedValue(true);
      const app = buildApp({ user: ADMIN, auth: { revokeAgendaKey } });

      const res = await request(app).delete(
        '/myagenda/admin/settings/api-keys/k1',
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ removed: true });
      expect(revokeAgendaKey).toHaveBeenCalledWith(2, 'k1');
    });

    it("404s when the key is absent or not this agenda's", async () => {
      const revokeAgendaKey = jest.fn().mockResolvedValue(false);
      const app = buildApp({ user: ADMIN, auth: { revokeAgendaKey } });

      const res = await request(app).delete(
        '/myagenda/admin/settings/api-keys/nope',
      );

      expect(res.status).toBe(404);
      expect(revokeAgendaKey).toHaveBeenCalledWith(2, 'nope');
    });
  });

  describe('rename', () => {
    it('200s { record } and delegates to the façade with the agenda uid', async () => {
      const record = { id: 'k1', name: 'CI export' };
      const renameAgendaKey = jest.fn().mockResolvedValue(record);
      const app = buildApp({ user: ADMIN, auth: { renameAgendaKey } });

      const res = await request(app)
        .patch('/myagenda/admin/settings/api-keys/k1')
        .send({ name: 'CI export' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ record });
      expect(renameAgendaKey).toHaveBeenCalledWith(2, 'k1', 'CI export');
    });

    it('400s when name is missing, without calling the façade', async () => {
      const renameAgendaKey = jest.fn();
      const app = buildApp({ user: ADMIN, auth: { renameAgendaKey } });

      const res = await request(app)
        .patch('/myagenda/admin/settings/api-keys/k1')
        .send({});

      expect(res.status).toBe(400);
      expect(renameAgendaKey).not.toHaveBeenCalled();
    });

    it('404s when the key is absent or not this agenda’s', async () => {
      const renameAgendaKey = jest.fn().mockResolvedValue(null);
      const app = buildApp({ user: ADMIN, auth: { renameAgendaKey } });

      const res = await request(app)
        .patch('/myagenda/admin/settings/api-keys/nope')
        .send({ name: 'x' });

      expect(res.status).toBe(404);
      expect(renameAgendaKey).toHaveBeenCalledWith(2, 'nope', 'x');
    });
  });
});
