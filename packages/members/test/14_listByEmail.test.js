import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import config from '../testconfig.js';
import Service from '../index.js';
import setup from './fixtures/setup.js';
import getUsersByUid from './fixtures/getUsersByUid.js';
import getEventCountByUserUid from './fixtures/getEventCountByUserUid.js';
import getAgendasByUid from './fixtures/getAgendasByUid.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('members - functional - list by email', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: { stakeholder: config.schema },
      data: [`${__dirname}/fixtures/member.data.sql`],
    });

    svc = Service({
      knex,
      schema: config.schema,
      interfaces: {
        getUsersByUid,
        getAgendasByUid,
        getEventCountByUserUid,
      },
    });
  });

  afterAll(() => knex?.destroy());

  // `email` is the cross-agenda lookup the scoped filters cannot express: no
  // agendaUid/userUid/id is given, yet it must not throw.
  test('finds a member by its legacy additional-info email, unscoped', async () => {
    const found = await svc.list({ email: 'janine@ponceau.fr' });

    expect(found).toHaveLength(1);
    expect(found[0].id).toBe(1);
    // The email is exposed under `custom` (fromDB parses the store), which the
    // supervisor lookup reads for the "email membre" column.
    expect(found[0].custom.email).toBe('janine@ponceau.fr');
  });

  test('matches the email field case-insensitively', async () => {
    const found = await svc.list({ email: 'JANINE@PONCEAU.FR' });

    expect(found.map((m) => m.id)).toEqual([1]);
  });

  test('matches the email field, not an arbitrary store substring', async () => {
    // "Ponceau" appears in contact_name of members 1 and 2, but it is not the
    // value of the email field, so a JSON-path email match returns nothing.
    const found = await svc.list({ email: 'ponceau@ponceau.fr' });

    expect(found).toEqual([]);
  });

  test('returns empty when no member carries the email', async () => {
    const found = await svc.list({ email: 'nobody@example.org' });

    expect(found).toEqual([]);
  });

  // The supervisor lookup feeds this filter the (often wrong) email a visitor
  // typed into Crisp, so a malformed value must yield no match, never throw.
  test('does not throw on a malformed email, just returns no match', async () => {
    const found = await svc.list({ email: 'not-an-email' });

    expect(found).toEqual([]);
  });

  // Blank/whitespace entries used to validate to null and crash on
  // `null.toLowerCase()`; they must now be dropped, keeping the valid ones.
  test('drops blank entries instead of crashing on a mixed list', async () => {
    const found = await svc.list({ email: ['', '  ', 'janine@ponceau.fr'] });

    expect(found.map((m) => m.id)).toEqual([1]);
  });
});
